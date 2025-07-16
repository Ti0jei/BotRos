import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/user/:userId/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can view stats' });
  }

  const { userId } = req.params;

  try {
    const all = await prisma.training.findMany({ where: { userId } });

    res.json({
      total: all.length,
      confirmed: all.filter(t => t.status === 'CONFIRMED').length,
      attended: all.filter(t => t.attended === true).length,
      missed: all.filter(t => t.attended === false).length,
    });
  } catch (err) {
    console.error('Ошибка получения статистики:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
