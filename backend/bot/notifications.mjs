import { bot } from './index.mjs';
import prisma from '../prisma/index.mjs';

/**
 * Отправка персонального уведомления пользователю
 * @param {number|string} telegramId - Telegram ID пользователя
 * @param {string} text - Текст уведомления
 * @param {string|null} trainingId - ID тренировки (для кнопок)
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

    const sentMessage = await bot.telegram.sendMessage(telegramId, text, extra);
    console.log(`✅ Уведомление отправлено: ${telegramId}${trainingId ? ' (с кнопками)' : ''}`);

    const timeoutMs = trainingId ? 5 * 24 * 60 * 60 * 1000 : 60 * 1000; // 5 дней или 60 секунд
    scheduleDelete(telegramId, sentMessage.message_id, timeoutMs);
  } catch (err) {
    console.error(`❌ Ошибка отправки пользователю ${telegramId}:`, err.message);
  }
}

/**
 * Массовая рассылка по роли
 * @param {string} text - Текст сообщения
 * @param {'USER' | 'ADMIN'} role - Целевая роль
 * @returns {{ success: number, total: number }}
 */
export async function notifyBroadcast(text, role = 'USER') {
  if (!['USER', 'ADMIN'].includes(role)) {
    console.warn(`❗ notifyBroadcast: недопустимая роль ${role}`);
    return { success: 0, total: 0 };
  }

  if (typeof text !== 'string' || text.trim().length < 5) {
    console.warn('❗ notifyBroadcast: текст слишком короткий');
    return { success: 0, total: 0 };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role,
        telegramId: { not: null },
        active: true,
      },
      select: { telegramId: true },
    });

    let success = 0;

    for (const user of users) {
      try {
        if (!user.telegramId || typeof user.telegramId !== 'number') continue;

        const sent = await bot.telegram.sendMessage(user.telegramId, `📰 ${text}`);
        success++;

        scheduleDelete(user.telegramId, sent.message_id, 60_000); // удаление через 60 сек
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

/**
 * Плановое удаление сообщения
 */
function scheduleDelete(telegramId, messageId, ms) {
  setTimeout(() => {
    bot.telegram.deleteMessage(telegramId, messageId).catch((err) => {
      console.warn(`⚠️ Не удалось удалить сообщение ${messageId} для ${telegramId}:`, err.message);
    });
  }, ms);
}
