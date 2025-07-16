import { Markup } from 'telegraf';
import { bot } from '../bot.mjs';

/**
 * Отправляет уведомление с inline-кнопками "Буду" / "Не буду"
 * @param {string} telegramId — ID пользователя в Telegram
 * @param {string} trainingId — ID тренировки в базе
 * @param {string} dateStr — Дата тренировки (YYYY-MM-DD)
 * @param {number} hour — Час (0–23)
 */
export async function notifyTelegramTraining(telegramId, trainingId, dateStr, hour) {
  const msg = `📅 Вам назначена тренировка на ${dateStr} в ${hour}:00\nПодтвердите участие:`;

  try {
    await bot.telegram.sendMessage(telegramId, msg, {
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Буду', `attend:${trainingId}`),
          Markup.button.callback('❌ Не буду', `decline:${trainingId}`)
        ]
      ])
    });
  } catch (err) {
    console.warn('⚠️ Ошибка отправки уведомления:', err.message);
  }
}
