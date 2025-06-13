import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// GET: Получение всех клиентов
router.get('/', authMiddleware, async (req, res) => {
  console.log('req.user:', req.user);

  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const clients = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        internalTag: true,
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

// PATCH: Обновление internalTag клиента
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { internalTag } = req.body;

  if (typeof internalTag !== 'string') {
    return res.status(400).json({ error: 'Invalid internalTag' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { internalTag },
    });
    res.json(updated);
  } catch (err) {
    console.error('Ошибка PATCH /clients/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
