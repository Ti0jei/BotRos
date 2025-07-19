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
  async function getTrainings(req, res) {
    const userId = req.user.userId;
    const role = req.user.role;
    const { date, blockId } = req.query;

    let dateFilter = {};
    if (date) {
      const start = dayjs(date).startOf('day').toDate();
      const end = dayjs(date).endOf('day').toDate();
      dateFilter = { date: { gte: start, lte: end } };
    }

    const where = role === 'ADMIN'
      ? { ...dateFilter }
      : { userId, ...dateFilter };

    if (blockId) {
      where.paymentBlockId = blockId;
    }

    const trainings = await prisma.training.findMany({
      where,
      include: {
        user: role === 'ADMIN',
        template: {
          include: {
            exercises: {
              include: {
                definition: true,
              },
            },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { hour: 'asc' }],
    });

    res.json(trainings);
  }
];
