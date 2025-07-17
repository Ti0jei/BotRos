import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.mjs';

const prisma = new PrismaClient();

export default [
  authMiddleware,
  async function getNextTraining(req, res) {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admin can view next training' });
    }

    const now = new Date();
    const training = await prisma.training.findFirst({
      where: { date: { gte: now } },
      include: { user: true },
      orderBy: [{ date: 'asc' }, { hour: 'asc' }],
    });

    res.json(training || null);
  }
];
