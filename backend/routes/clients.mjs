import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const clients = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        extraName: true,  // Важно сюда добавить
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
