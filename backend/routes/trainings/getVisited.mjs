import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/single/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const trainings = await prisma.training.findMany({
      where: {
        userId,
        attended: true,
      },
      select: {
        id: true,
        date: true,
        hour: true,
        isSinglePaid: true,
        blockId: true,
        singlePrice: true,
        singlePaymentMethod: true,
      },
      orderBy: [{ date: 'desc' }, { hour: 'desc' }],
    });

    const response = trainings.map(t => ({
      id: t.id,
      date: t.date,
      hour: t.hour,
      isSinglePaid: t.isSinglePaid,
      singlePrice: t.singlePrice ?? null,
      singlePaymentMethod: t.singlePaymentMethod ?? null,
      paymentBlockId: t.blockId ?? null,
    }));

    res.json(response);
  } catch (err) {
    console.error('Ошибка получения списка посещённых тренировок:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
