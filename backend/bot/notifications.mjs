import { bot } from './index.mjs';
import prisma from '../prisma/index.mjs'; // ← импорт Prisma клиента

/**
 * Отправка персонального уведомления пользователю
 * @param {number|string} telegramId - Telegram ID пользователя
 * @param {string} text - Текст уведомления
 * @param {string|null} trainingId - ID тренировки для добавления кнопок
 */
export async function notifyTelegram(telegramId, text, trainingId = null) {
  if (!telegramId || !text) {
    console.warn('❗ notifyTelegram: отсутствуют обязательные параметры');
    return;
  }

  try {
    const extra = trainingId
      ? {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Буду', callback_data: `attend:${trainingId}` },
                { text: '❌ Не буду', callback_data: `decline:${trainingId}` },
              ],
            ],
          },
        }
      : {};

    await bot.telegram.sendMessage(telegramId, text, extra);
    console.log(`✅ Уведомление отправлено: ${telegramId}${trainingId ? ' (с кнопками)' : ''}`);
  } catch (err) {
    console.error(`❌ Ошибка отправки пользователю ${telegramId}:`, err.message);
  }
}

/**
 * Массовая рассылка уведомлений по роли
 * @param {string} text - Текст уведомления
 * @param {'USER' | 'ADMIN'} role - Целевая роль
 * @returns {{ success: number, total: number }}
 */
export async function notifyBroadcast(text, role = 'USER') {
  if (!text || !role) {
    console.warn('❗ notifyBroadcast: отсутствуют параметры');
    return { success: 0, total: 0 };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role,
        telegramId: { not: null },
      },
      select: {
        telegramId: true,
      },
    });

    let success = 0;

    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.telegramId, `📰 ${text}`);
        success++;
      } catch (err) {
        console.error(`❌ Не удалось отправить ${user.telegramId}:`, err.message);
      }
    }

    console.log(`📢 Рассылка завершена: ${success}/${users.length} успешно.`);
    return { success, total: users.length };
  } catch (err) {
    console.error('❌ Ошибка notifyBroadcast:', err.message);
    return { success: 0, total: 0 };
  }
}
