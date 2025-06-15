import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// 🔐 Получить профиль текущего пользователя
router.get('/', async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Неавторизован' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      lastName: true,
      internalTag: true,
      age: true,
      role: true,
    },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// 👥 Получить всех клиентов (только для ADMIN)
router.get('/all', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      internalTag: true,
      age: true,
    },
  });

  res.json(users);
});

export default router;
