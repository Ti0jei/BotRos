import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Получить активный блок оплаты по userId
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

// 🔹 Получить все блоки оплаты по userId (для истории)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  const blocks = await prisma.paymentBlock.findMany({
    where: { userId },
    orderBy: { paidAt: 'desc' },
  });

  res.json(blocks);
});

// 🔹 Получить активный блок оплаты по telegramId
router.get('/telegram/:telegramId/active', authMiddleware, async (req, res) => {
  const { telegramId } = req.params;

  const user = await prisma.user.findUnique({
    where: { telegramId },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const block = await prisma.paymentBlock.findFirst({
    where: {
      userId: user.id,
      active: true,
    },
    orderBy: {
      paidAt: 'desc',
    },
  });

  if (!block) return res.status(404).json({ error: 'No active block found' });

  res.json(block);
});

// 🔹 Добавить новый блок оплаты
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

  // Деактивировать предыдущие блоки
  await prisma.paymentBlock.updateMany({
    where: {
      userId,
      id: { not: newBlock.id },
    },
    data: { active: false },
  });

  res.json(newBlock);
});

// 🔹 Обновить существующий блок оплаты (включая used)
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    paidAt,
    paidTrainings,
    pricePerTraining,
    used, // 👈 теперь поддерживается обновление
    active, // 👈 поддержка изменения статуса активности
  } = req.body;

  const updated = await prisma.paymentBlock.update({
    where: { id },
    data: {
      paidAt: paidAt ? new Date(paidAt) : undefined,
      paidTrainings: paidTrainings !== undefined ? Number(paidTrainings) : undefined,
      pricePerTraining: pricePerTraining !== undefined ? Number(pricePerTraining) : undefined,
      used: typeof used === 'number' ? used : undefined,
      active: typeof active === 'boolean' ? active : undefined,
    },
  });

  res.json(updated);
});

export default router;
