import express from 'express';
import { PrismaClient } from '@prisma/client';
import { notifyTelegram } from '../utils/telegram.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// Получить тренировки
router.get('/', async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const { date } = req.query;

  let dateFilter = {};

  if (date) {
    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59`);
    dateFilter = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  const where = role === 'ADMIN'
    ? dateFilter
    : { userId, ...dateFilter };

  const trainings = await prisma.training.findMany({
    where,
    include: role === 'ADMIN' ? { user: true } : undefined,
    orderBy: [{ date: 'asc' }, { hour: 'asc' }],
  });

  res.json(trainings);
});

// Назначить тренировку
router.post('/', async (req, res) => {
  const { userId, date, hour } = req.body;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can assign trainings' });
  }

  const training = await prisma.training.create({
    data: {
      userId,
      date: new Date(`${date}T00:00:00`),
      hour: parseInt(hour),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.telegramId) {
    await notifyTelegram(
      user.telegramId,
      `📅 Вам назначена тренировка на ${new Date(date).toLocaleDateString()} в ${hour}:00\nПодтвердите участие в приложении ✅❌`
    );
  }

  res.json(training);
});

// Удалить тренировку
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can delete trainings' });
  }

  const training = await prisma.training.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!training) return res.status(404).json({ error: 'Not found' });

  await prisma.training.delete({ where: { id } });

  if (training.user?.telegramId) {
    await notifyTelegram(
      training.user.telegramId,
      `❌ Ваша тренировка на ${new Date(training.date).toLocaleDateString()} в ${training.hour}:00 была отменена`
    );
  }

  res.json({ success: true });
});

// Подтвердить/отменить тренировку
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;

  const training = await prisma.training.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!training || training.userId !== userId) {
    return res.status(404).json({ error: 'Not found' });
  }

  const updated = await prisma.training.update({
    where: { id },
    data: { status },
  });

  const user = training.user;

  if (user?.telegramId) {
    const text =
      status === 'CONFIRMED'
        ? '✅ вы подтвердили участие'
        : '🚫 вы отказались от тренировки';
    await notifyTelegram(user.telegramId, `📌 Вы обновили статус тренировки: ${text}`);
  }

  const trainer = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (trainer?.telegramId) {
    const formattedDate = new Date(training.date).toLocaleDateString();
    const trainerText =
      status === 'CONFIRMED'
        ? `👤 ${user.name} подтвердил участие на тренировке ${formattedDate} в ${training.hour}:00`
        : `👤 ${user.name} не подтвердил участие на тренировке ${formattedDate} в ${training.hour}:00`;

    await notifyTelegram(trainer.telegramId, trainerText);
  }

  res.json(updated);
});

// ✅ Отметить присутствие тренером и учесть в оплате
router.patch('/:id/attended', async (req, res) => {
  const { id } = req.params;
  const { attended } = req.body;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can mark attendance' });
  }

  const training = await prisma.training.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!training) {
    return res.status(404).json({ error: 'Training not found' });
  }

  const updated = await prisma.training.update({
    where: { id },
    data: { attended },
  });

  if (attended === true) {
    const activeBlock = await prisma.paymentBlock.findFirst({
      where: { userId: training.userId, active: true },
    });

    if (activeBlock) {
      const nextUsed = activeBlock.used + 1;

      await prisma.paymentBlock.update({
        where: { id: activeBlock.id },
        data: { used: nextUsed },
      });

      if (nextUsed >= activeBlock.sessions) {
        await prisma.paymentBlock.update({
          where: { id: activeBlock.id },
          data: { active: false },
        });

        const trainer = await prisma.user.findFirst({
          where: { role: 'ADMIN' },
        });

        if (trainer?.telegramId) {
          await notifyTelegram(
            trainer.telegramId,
            `❗ У клиента ${training.user.name} закончился блок тренировок (${nextUsed} из ${activeBlock.sessions}). Напомните ему о необходимости оплаты.`
          );
        }
      }
    }
  }

  res.json(updated);
});

// 📊 Получить статистику по клиенту
router.get('/user/:userId/stats', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can view stats' });
  }

  const { userId } = req.params;

  const all = await prisma.training.findMany({ where: { userId } });

  const stats = {
    total: all.length,
    confirmed: all.filter(t => t.status === 'CONFIRMED').length,
    attended: all.filter(t => t.attended === true).length,
    missed: all.filter(t => t.attended === false).length,
  };

  res.json(stats);
});

export default router;
