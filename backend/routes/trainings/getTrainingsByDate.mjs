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
  async function getTrainingsByDate(req, res) {
    const { date } = req.params;

    try {
      const start = dayjs(date).startOf('day').toDate();
      const end = dayjs(date).endOf('day').toDate();

      const trainings = await prisma.training.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              internalTag: true,
            },
          },
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
        orderBy: { hour: 'asc' },
      });

      res.json(trainings);
    } catch (err) {
      console.error('Ошибка при получении тренировок по дате:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
];
