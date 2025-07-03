import express from 'express';
import { PrismaClient } from '@prisma/client';
import { notifyTelegram } from '../utils/telegram.mjs';
import { authMiddleware } from '../middleware/auth.mjs';
import { shouldNotifyUser, shouldNotifyTrainer } from '../lib/antiSpam.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// Получить тренировки
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  const { date } = req.query;

  let dateFilter = {};
  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);
    dateFilter = { date: { gte: start, lte: end } };
  }

  const where = role === 'ADMIN' ? dateFilter : { userId, ...dateFilter };
  const trainings = await prisma.training.findMany({
    where,
    include: role === 'ADMIN' ? { user: true } : undefined,
    orderBy: [{ date: 'asc' }, { hour: 'asc' }],
  });

  res.json(trainings);
});

// Назначить тренировку
router.post('/', authMiddleware, async (req, res) => {
  const { userId, date, hour, isSinglePaid = false } = req.body;
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can assign trainings' });
  }

  const training = await prisma.training.create({
    data: {
      userId,
      date: new Date(`${date}T00:00:00`),
      hour: parseInt(hour),
      isSinglePaid,
      status: 'PENDING', // ✅ ЯВНО добавлен статус
    },
  });

  const now = new Date();
  const trainingDateTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.telegramId && trainingDateTime > now && shouldNotifyUser(user.telegramId)) {
    await notifyTelegram(
      user.telegramId,
      `📅 Вам назначена тренировка на ${new Date(date).toLocaleDateString()} в ${hour}:00\nПодтвердите участие в приложении ✅❌`
    );
  }

  res.json(training);
});

// Удалить тренировку
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admin can delete trainings' });

  const training = await prisma.training.findUnique({ where: { id }, include: { user: true } });
  if (!training) return res.status(404).json({ error: 'Not found' });

  await prisma.training.delete({ where: { id } });

  const today = new Date();
  const trainingDate = new Date(training.date);
  if (training.user?.telegramId && trainingDate >= new Date(today.toDateString())) {
    await notifyTelegram(
      training.user.telegramId,
      `❌ Ваша тренировка на ${trainingDate.toLocaleDateString()} в ${training.hour}:00 была отменена`
    );
  }

  res.json({ success: true });
});

// Подтвердить / отказаться
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;

  const training = await prisma.training.findUnique({ where: { id }, include: { user: true } });
  if (!training || training.userId !== userId) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.training.update({ where: { id }, data: { status } });

  if (training.user?.telegramId && shouldNotifyUser(training.user.telegramId)) {
    const msg = status === 'CONFIRMED' ? '✅ вы подтвердили участие' : '🚫 вы отказались от тренировки';
    await notifyTelegram(training.user.telegramId, `📌 Вы обновили статус тренировки: ${msg}`);
  }

  const trainer = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (trainer?.telegramId && shouldNotifyTrainer(trainer.telegramId)) {
    const dateStr = new Date(training.date).toLocaleDateString();
    const msg = status === 'CONFIRMED'
      ? `👤 ${training.user.name} подтвердил участие ${dateStr} в ${training.hour}:00`
      : `👤 ${training.user.name} не подтвердил участие ${dateStr} в ${training.hour}:00`;
    await notifyTelegram(trainer.telegramId, msg);
  }

  res.json(updated);
});

// Отметить посещение
router.patch('/:id/attended', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { attended } = req.body;
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admin can mark attendance' });

  const training = await prisma.training.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!training) return res.status(404).json({ error: 'Training not found' });

  if (training.attended === attended) {
    return res.status(200).json(training);
  }

  if (training.isSinglePaid) {
    const updated = await prisma.training.update({
      where: { id },
      data: { attended },
    });
    return res.json(updated);
  }

  const updated = await prisma.training.update({
    where: { id },
    data: { attended, wasCounted: true },
  });

  if ((attended === true || attended === false) && training.wasCounted !== true) {
    const trainingDate = new Date(training.date);
    const activeBlock = await prisma.paymentBlock.findFirst({
      where: { userId: training.userId, active: true },
    });

    const dateOnly = (d: Date) => d.toISOString().slice(0, 10);

    if (activeBlock && dateOnly(trainingDate) >= dateOnly(activeBlock.paidAt)) {
      const currentUsed = activeBlock.used || 0;
      const nextUsed = currentUsed + 1;

      await prisma.paymentBlock.update({
        where: { id: activeBlock.id },
        data: { used: nextUsed },
      });

      if (nextUsed >= activeBlock.paidTrainings) {
        await prisma.paymentBlock.update({
          where: { id: activeBlock.id },
          data: { active: false },
        });

        const trainer = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (trainer?.telegramId && shouldNotifyTrainer(trainer.telegramId)) {
          await notifyTelegram(
            trainer.telegramId,
            `❗ У клиента ${training.user.name} закончился блок (${nextUsed} из ${activeBlock.paidTrainings}). Напомните ему об оплате.`
          );
        }
      }
    }
  }

  return res.json(updated);
});

// Статистика
router.get('/user/:userId/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admin can view stats' });

  const { userId } = req.params;
  const all = await prisma.training.findMany({ where: { userId } });

  res.json({
    total: all.length,
    confirmed: all.filter(t => t.status === 'CONFIRMED').length,
    attended: all.filter(t => t.attended === true).length,
    missed: all.filter(t => t.attended === false).length,
  });
});

// Получить разовые тренировки
router.get('/single/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  const trainings = await prisma.training.findMany({
    where: {
      userId,
      isSinglePaid: true,
    },
    orderBy: [
      { date: 'desc' },
      { hour: 'desc' },
    ],
  });

  res.json(trainings);
});

// Получить ближайшую тренировку
router.get('/next', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can view next training' });
  }

  const now = new Date();

  const training = await prisma.training.findFirst({
    where: {
      date: { gte: now },
    },
    include: { user: true },
    orderBy: [
      { date: 'asc' },
      { hour: 'asc' },
    ],
  });

  res.json(training || null);
});

export default router;
