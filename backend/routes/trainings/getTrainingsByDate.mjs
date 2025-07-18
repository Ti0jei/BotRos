import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.mjs';

const prisma = new PrismaClient();

export default [
  authMiddleware,
  async function getTrainingsByDate(req, res) {
    const { date } = req.params;

    try {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);

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
