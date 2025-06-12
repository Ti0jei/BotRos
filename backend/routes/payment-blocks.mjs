import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// Получить активный блок оплаты клиента
router.get('/user/:userId/active', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  const block = await prisma.paymentBlock.findFirst({
    where: {
      userId,
      active: true,
    },
    orderBy: {
      paidAt: 'desc',
    },
  });

  if (!block) return res.status(404).json({ error: 'No active block found' });

  res.json(block);
});

// Добавить новый блок оплаты
router.post('/', authMiddleware, async (req, res) => {
  const { userId, paidAt, paidTrainings, pricePerTraining } = req.body;

  const newBlock = await prisma.paymentBlock.create({
    data: {
      userId,
      paidAt: new Date(paidAt),
      paidTrainings: Number(paidTrainings),
      pricePerTraining: Number(pricePerTraining),
      active: true,
    },
  });

  // Деактивировать предыдущие блоки (если есть)
  await prisma.paymentBlock.updateMany({
    where: {
      userId,
      id: {
        not: newBlock.id,
      },
    },
    data: {
      active: false,
    },
  });

  res.json(newBlock);
});

// Обновить существующий блок оплаты
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { paidAt, paidTrainings, pricePerTraining } = req.body;

  const updated = await prisma.paymentBlock.update({
    where: { id },
    data: {
      paidAt: new Date(paidAt),
      paidTrainings: Number(paidTrainings),
      pricePerTraining: Number(pricePerTraining),
    },
  });

  res.json(updated);
});

export default router;
