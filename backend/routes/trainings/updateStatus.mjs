import express from 'express';
import { PrismaClient } from '@prisma/client';
import { notifyTelegram } from '../../bot/notifications.mjs';
import { shouldNotifyUser, shouldNotifyTrainer } from '../../lib/antiSpam.mjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let userId = null;

  // Попробуем извлечь userId из JWT-токена (если он есть)
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      if (decoded && typeof decoded === 'object' && decoded.userId) {
        userId = decoded.userId;
      }
    }
  } catch (e) {
    console.warn('⚠️ Ошибка парсинга токена:', e.message);
  }

  const training = await prisma.training.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!training) {
    return res.status(404).json({ error: 'Тренировка не найдена' });
  }

  // Если авторизован, проверим, это ли его тренировка
  if (userId && training.userId !== userId) {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }

  const dataToUpdate = {
    status,
    attended: status === 'CONFIRMED',
    wasCounted: status === 'CONFIRMED',
  };

  // Откат использования блока при отказе (если нужно)
  if (status === 'DECLINED' && training.blockId && training.wasCounted) {
    await prisma.paymentBlock.update({
      where: { id: training.blockId },
      data: {
        used: { decrement: 1 },
      },
    });
    dataToUpdate.wasCounted = false;
    dataToUpdate.attended = false;
  }

  const updated = await prisma.training.update({
    where: { id },
    data: dataToUpdate,
  });

  // Уведомление пользователя
  if (training.user?.telegramId && shouldNotifyUser(training.user.telegramId)) {
    const msg =
      status === 'CONFIRMED'
        ? '✅ вы подтвердили участие'
        : '🚫 вы отказались от тренировки';

    await notifyTelegram(
      training.user.telegramId,
      `📌 Вы обновили статус тренировки: ${msg}`
    );
  }

  // Уведомление тренера (ADMIN)
  const trainer = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  if (trainer?.telegramId && shouldNotifyTrainer(trainer.telegramId)) {
    const dateStr = new Date(training.date).toLocaleDateString();
    const msg =
      status === 'CONFIRMED'
        ? `👤 ${training.user.name} подтвердил участие ${dateStr} в ${training.hour}:00`
        : `👤 ${training.user.name} не подтвердил участие ${dateStr} в ${training.hour}:00`;

    await notifyTelegram(trainer.telegramId, msg);
  }

  res.json(updated);
});

export default router;
