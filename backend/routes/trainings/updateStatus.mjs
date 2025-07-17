import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.mjs';
import { notifyTelegram } from '../../utils/telegram.mjs';
import { shouldNotifyUser, shouldNotifyTrainer } from '../../lib/antiSpam.mjs';

const router = express.Router();
const prisma = new PrismaClient();

router.patch('/:id', authMiddleware, async (req, res) => {
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
