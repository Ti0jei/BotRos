import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  console.log('req.user:', req.user); // Для отладки

  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const clients = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        internalTag: true,  // Правильное имя поля
        email: true,
        age: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(clients);
  } catch (err) {
    console.error('Ошибка получения клиентов:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
