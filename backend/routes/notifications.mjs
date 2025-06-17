import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// Получение данных по дням (14 последних)
router.get('/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const entries = await prisma.nutritionEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 14,
    });

    res.json(entries);
  } catch (err) {
    console.error('Ошибка получения питания:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение сумм за неделю/месяц
router.get('/summary/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const { period = 'week' } = req.query;

  const days = period === 'month' ? 30 : 7;
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days + 1);

  try {
    const entries = await prisma.nutritionEntry.findMany({
      where: {
        userId,
        date: { gte: dateFrom },
      },
    });

    const total = {
      period,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };

    for (const entry of entries) {
      total.calories += entry.calories;
      total.protein += entry.protein;
      total.fat += entry.fat;
      total.carbs += entry.carbs;
    }

    res.json(total);
  } catch (err) {
    console.error('Ошибка расчёта summary:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавление или обновление записи
router.post('/', authMiddleware, async (req, res) => {
  const { userId, date, calories, protein, fat, carbs } = req.body;

  if (!userId || !date) {
    return res.status(400).json({ error: 'Недостаточно данных' });
  }

  try {
    const entry = await prisma.nutritionEntry.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        },
      },
      update: {
        calories,
        protein,
        fat,
        carbs,
      },
      create: {
        userId,
        date: new Date(date),
        calories,
        protein,
        fat,
        carbs,
      },
    });

    res.json(entry);
  } catch (err) {
    console.error('Ошибка сохранения питания:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление записи питания по дате
router.delete('/:userId/:date', authMiddleware, async (req, res) => {
  const { userId, date } = req.params;

  if (!userId || !date) {
    return res.status(400).json({ error: 'Недостаточно данных' });
  }

  try {
    await prisma.nutritionEntry.delete({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        },
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка удаления записи питания:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
