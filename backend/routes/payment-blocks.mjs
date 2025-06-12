import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Получить активный блок оплаты клиента
router.get('/user/:userId/active', async (req, res) => {
  const { userId } = req.params;

  const block = await prisma.paymentBlock.findFirst({
    where: {
      userId,
      active: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  if (!block) return res.status(404).json({ error: 'No active block found' });

  res.json(block);
});

// Добавить новый блок оплаты
router.post('/', async (req, res) => {
  const { userId, date, sessions, price } = req.body;

  const newBlock = await prisma.paymentBlock.create({
    data: {
      userId,
      date: new Date(date),
      sessions: Number(sessions),
      price: Number(price),
      used: 0,
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
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { date, sessions, price, used } = req.body;

  const updated = await prisma.paymentBlock.update({
    where: { id },
    data: {
      date: new Date(date),
      sessions: Number(sessions),
      price: Number(price),
      used: Number(used),
    },
  });

  res.json(updated);
});

export default router;
