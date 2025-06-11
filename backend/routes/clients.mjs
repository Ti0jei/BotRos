import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Только для ADMIN
router.get('/', async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const clients = await prisma.user.findMany({
    where: { role: 'USER' },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      createdAt: true
    }
  });

  res.json(clients);
});

export default router;
