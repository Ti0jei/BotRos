import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.mjs';

const prisma = new PrismaClient();

export default [
  authMiddleware,
  async function getTrainings(req, res) {
    const userId = req.user.userId;
    const role = req.user.role;
    const { date, blockId } = req.query;

    let dateFilter = {};
    if (date) {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59`);
      dateFilter = { date: { gte: start, lte: end } };
    }

    const where = role === 'ADMIN'
      ? { ...dateFilter }
      : { userId, ...dateFilter };

    // 🔥 Новый фильтр по paymentBlockId
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
