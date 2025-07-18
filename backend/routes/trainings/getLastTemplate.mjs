import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { PrismaClient } from '@prisma/client';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();

export default async function getLastTemplate(req, res) {
  const { userId } = req.params;

  try {
    const lastTraining = await prisma.training.findFirst({
      where: {
        userId,
        templateId: { not: null },
      },
      include: {
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
      orderBy: [
        { date: 'desc' }, 
        { hour: 'desc' }
      ],
    });

    res.json(lastTraining?.template || null);
  } catch (err) {
    console.error('Ошибка получения последнего шаблона:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
