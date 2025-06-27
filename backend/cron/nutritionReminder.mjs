import cron from 'node-cron';
import prisma from '../lib/prisma.mjs';
import dayjs from 'dayjs';
import { sendTelegramMessage } from '../lib/telegram.mjs';

// ⏰ Задача запускается каждый день в 21:00
cron.schedule('0 18 * * *', async () => {
  console.log('🔔 [21:00] Проверка КБЖУ для всех пользователей');

  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        notificationsMuted: false, // ✅ Только тем, кто НЕ отключил
        telegramId: { not: null }, // ✅ Только у кого есть Telegram ID
      },
      select: {
        id: true,
        telegramId: true,
        name: true, // для логов
      },
    });

    const today = dayjs().startOf('day').toDate();

    for (const user of users) {
      try {
        const record = await prisma.nutrition.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: today,
            },
          },
        });

        if (!record) {
          console.log(`📤 Отправляем напоминание ${user.name || user.id} → ${user.telegramId}`);

          await sendTelegramMessage(
            user.telegramId,
            '📋 Напоминание: вы не заполнили КБЖУ за сегодня. Пожалуйста, внесите данные в мини-приложении.'
          );
        } else {
          console.log(`✅ Уже есть запись КБЖУ: ${user.name || user.id}`);
        }
      } catch (err) {
        console.error(`❌ Ошибка при проверке ${user.name || user.id}:`, err);
      }
    }

  } catch (err) {
    console.error('❌ Ошибка при выполнении задачи cron:', err);
  }
});
