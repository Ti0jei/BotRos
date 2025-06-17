import express from 'express';
import prisma from '../lib/prisma.mjs';
import dayjs from 'dayjs';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();

// Авторизация
router.use(authMiddleware);

// Получить всё питание пользователя
router.get('/:userId', async (req, res) => {
  try {
    const nutrition = await prisma.nutrition.findMany({
      where: { userId: req.params.userId },
      orderBy: { date: 'desc' },
    });
    res.json(nutrition);
  } catch (error) {
    console.error('❌ Ошибка при получении питания:', error);
    res.status(500).json({ error: 'Ошибка при получении питания' });
  }
});

// Получить суммарные значения (неделя / месяц)
router.get('/summary/:userId', async (req, res) => {
  const { userId } = req.params;
  const { period } = req.query;

  try {
    const startDate = period === 'week'
      ? dayjs().startOf('week').toDate()
      : period === 'month'
      ? dayjs().startOf('month').toDate()
      : null;

    if (!startDate) {
      return res.status(400).json({ error: 'Некорректный период' });
    }

    const result = await prisma.nutrition.aggregate({
      _sum: { calories: true, protein: true, fat: true, carbs: true },
      where: {
        userId,
        date: { gte: startDate },
      },
    });

    res.json({
      period,
      calories: result._sum.calories || 0,
      protein: result._sum.protein || 0,
      fat: result._sum.fat || 0,
      carbs: result._sum.carbs || 0,
    });
  } catch (error) {
    console.error('❌ Ошибка при подсчёте суммы:', error);
    res.status(500).json({ error: 'Ошибка при подсчёте суммы' });
  }
});

// Добавить или обновить запись
router.post('/', async (req, res) => {
  if (req.user?.role === 'ADMIN') {
    return res.status(403).json({ error: 'Администраторам запрещено редактировать питание' });
  }

  const { userId, date, calories, protein, fat, carbs } = req.body;

  if (!userId || !date) {
    return res.status(400).json({ error: 'Необходимы userId и дата' });
  }

  try {
    const existing = await prisma.nutrition.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        },
      },
    });

    if (existing) {
      await prisma.nutrition.update({
        where: {
          userId_date: {
            userId,
            date: new Date(date),
          },
        },
        data: { calories, protein, fat, carbs },
      });
    } else {
      await prisma.nutrition.create({
        data: {
          userId,
          date: new Date(date),
          calories,
          protein,
          fat,
          carbs,
        },
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Ошибка при сохранении питания:', error);
    res.status(500).json({ error: 'Ошибка при сохранении питания' });
  }
});

// Удалить запись
router.delete('/:userId/:date', async (req, res) => {
  if (req.user?.role === 'ADMIN') {
    return res.status(403).json({ error: 'Администраторам запрещено удалять питание' });
  }

  const { userId, date } = req.params;

  try {
    await prisma.nutrition.delete({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        },
      },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Ошибка при удалении питания:', error);
    res.status(500).json({ error: 'Ошибка при удалении питания' });
  }
});

export default router;
