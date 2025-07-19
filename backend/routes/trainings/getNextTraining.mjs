import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.mjs';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();

export default [
  authMiddleware,
  async function getNextTraining(req, res) {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admin can view next training' });
    }

    const now = dayjs().toDate();

    const training = await prisma.training.findFirst({
      where: { date: { gte: now } },
      include: { user: true },
      orderBy: [{ date: 'asc' }, { hour: 'asc' }],
    });

    res.json(training || null);
  }
];
