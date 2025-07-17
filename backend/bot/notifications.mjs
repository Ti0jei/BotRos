// bot/notifications.mjs

import { bot } from './index.mjs';

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
 * Массовая рассылка уведомлений пользователям (по ролям)
 * @param {Object} options - Опции рассылки
 * @param {string} options.text - Текст рассылки
 * @param {string} [options.to='ALL'] - 'ALL' или 'ADMINS'
 * @param {Array<{telegramId: string, role: string}>} users - Список пользователей
 */
export async function notifyBroadcast({ text, to = 'ALL' }, users) {
  if (!text || !Array.isArray(users)) {
    console.warn('❗ notifyBroadcast: некорректные входные параметры');
    return;
  }

  const filtered = to === 'ADMINS'
    ? users.filter((u) => u.role === 'ADMIN' && u.telegramId)
    : users.filter((u) => u.telegramId);

  let success = 0;

  for (const user of filtered) {
    try {
      await bot.telegram.sendMessage(user.telegramId, `📰 ${text}`);
      success++;
    } catch (err) {
      console.error(`❌ Не удалось отправить ${user.telegramId}:`, err.message);
    }
  }

  console.log(`📢 Рассылка завершена: ${success}/${filtered.length} успешно.`);
}
