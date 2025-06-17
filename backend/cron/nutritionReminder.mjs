import cron from 'node-cron';
import prisma from '../lib/prisma.mjs';
import dayjs from 'dayjs';
import { sendTelegramMessage } from '../lib/telegram.mjs';

cron.schedule('0 21 * * *', async () => {
  console.log('🔔 Проверка КБЖУ в 21:00');

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true, telegramId: true },
  });

  const today = dayjs().startOf('day').toDate();

  for (const user of users) {
    const record = await prisma.nutrition.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (!record && user.telegramId) {
      await sendTelegramMessage(
        user.telegramId,
        '📋 Напоминание: вы не заполнили КБЖУ за сегодня. Пожалуйста, внесите данные в мини-приложении.'
      );
    }
  }
});
