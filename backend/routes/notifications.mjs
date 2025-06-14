import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';
import { notifyTelegram } from '../utils/telegram.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/notifications/remind/:trainingId
router.post('/remind/:trainingId', authMiddleware, async (req, res) => {
  const { trainingId } = req.params;

  // Только админ может отправлять напоминания
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can send reminders' });
  }

  const training = await prisma.training.findUnique({
    where: { id: trainingId },
    include: { user: true },
  });

  if (!training || training.status !== 'PENDING') {
    return res.status(404).json({ error: 'Training not found or already confirmed/declined' });
  }

  if (!training.user?.telegramId) {
    return res.status(400).json({ error: 'User has no Telegram ID' });
  }

  const dateStr = new Date(training.date).toLocaleDateString('ru-RU');
  const timeStr = `${training.hour}:00`;

  const message = `⏰ Напоминание!\nВам назначена тренировка на ${dateStr} в ${timeStr}.\nПожалуйста, подтвердите участие в приложении ✅❌`;

  await notifyTelegram(training.user.telegramId, message);

  return res.json({ success: true });
});

export default router;
