// bot/notifications.mjs

import { bot } from './index.mjs';

/**
 * Отправка персонального уведомления пользователю
 * @param {number|string} telegramId - Telegram ID пользователя
 * @param {string} text - Текст уведомления
 * @param {string|null} trainingId - ID тренировки для добавления кнопок
 */
export async function notifyTelegram(telegramId, text, trainingId = null) {
  if (!telegramId) {
    console.warn('❗ notifyTelegram: не указан telegramId');
    return;
  }

  const payload = {
    chat_id: telegramId,
    text,
  };

  // Добавляем inline-кнопки при наличии trainingId
  if (trainingId) {
    payload.reply_markup = {
      inline_keyboard: [[
        { text: '✅ Буду', callback_data: `attend:${trainingId}` },
        { text: '❌ Не буду', callback_data: `decline:${trainingId}` }
      ]]
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('❌ Telegram API ошибка:', data);
    } else {
      console.log(`✅ Уведомление отправлено: ${telegramId}`);
    }
  } catch (err) {
    console.error('❌ Ошибка отправки уведомления:', err.message);
  }
}

/**
 * Рассылка уведомлений пользователям (по ролям)
 * @param {Object} options - Опции рассылки
 * @param {string} options.text - Текст рассылки
 * @param {string} options.to - 'ALL' или 'ADMINS'
 * @param {Array} users - Список всех пользователей [{ telegramId, role }]
 */
export async function notifyBroadcast({ text, to = 'ALL' }, users) {
  const targets =
    to === 'ADMINS'
      ? users.filter((u) => u.role === 'ADMIN' && u.telegramId)
      : users.filter((u) => u.telegramId);

  for (const user of targets) {
    try {
      await bot.telegram.sendMessage(user.telegramId, `📰 ${text}`);
    } catch (err) {
      console.error(`❌ Не удалось отправить ${user.telegramId}:`, err.message);
    }
  }
}
