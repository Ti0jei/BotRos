import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';
import { notifyTelegram } from '../utils/telegram.mjs';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// ✅ Получить статус оповещений
router.get('/', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Нет доступа' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsMuted: true },
    });

    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    res.json({ muted: !!user.notificationsMuted });
  } catch (err) {
    console.error('Ошибка при получении статуса оповещений:', err);
    res.status(500).json({ error: 'Ошибка при получении статуса оповещений' });
  }
});

// ✅ Обновить статус оповещений
router.patch('/', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Нет доступа' });

  const { muted } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { notificationsMuted: !!muted },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Ошибка при обновлении статуса оповещений:', err);
    res.status(500).json({ error: 'Ошибка при обновлении статуса оповещений' });
  }
});

// ✅ Напоминание тренировки (всегда)
router.post('/remind/:trainingId', async (req, res) => {
  const { trainingId } = req.params;

  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can send reminders' });
  }

  try {
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

    // ✅ передаём training.id, чтобы кнопки появились
    await notifyTelegram(training.user.telegramId, message, training.id);

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при отправке напоминания:', err);
    res.status(500).json({ error: 'Ошибка при отправке напоминания' });
  }
});

export default router;
