import fetch from 'node-fetch';

/**
 * Удаляет сообщение через заданное время
 * @param {import('telegraf').Context} ctx - Контекст Telegraf
 * @param {import('typegram').Message.TextMessage} message - Сообщение, которое нужно удалить
 * @param {number} [delay=3000] - Задержка в миллисекундах
 */
export function autoDelete(ctx, message, delay = 3000) {
  if (!ctx || !ctx.chat || !message?.message_id) return;

  setTimeout(() => {
    ctx.telegram.deleteMessage(ctx.chat.id, message.message_id).catch(() => {});
  }, delay);
}

/**
 * Проверяет регистрацию пользователя по Telegram ID
 * @param {number|string} telegramId - Telegram ID пользователя
 * @returns {Promise<boolean>} true если пользователь зарегистрирован
 */
export async function checkTelegramAccess(telegramId) {
  if (!telegramId) return false;

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/auth/check-telegram?telegramId=${telegramId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data?.exists === true;
  } catch (e) {
    console.error('❌ Ошибка доступа Telegram:', e.message);
    return false;
  }
}
