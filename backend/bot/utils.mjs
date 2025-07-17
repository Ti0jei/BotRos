// bot/utils.mjs

/**
 * Удаляет сообщение через заданное время
 * @param {import('telegraf').Context} ctx
 * @param {import('typegram').Message.TextMessage} message
 * @param {number} delay
 */
export function autoDelete(ctx, message, delay = 3000) {
  setTimeout(() => {
    ctx.telegram.deleteMessage(ctx.chat.id, message.message_id).catch(() => {});
  }, delay);
}

/**
 * Проверяет наличие доступа по Telegram ID
 * @param {number|string} telegramId
 * @returns {Promise<boolean>}
 */
export async function checkTelegramAccess(telegramId) {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/auth/check-telegram?telegramId=${telegramId}`);
    const data = await res.json();
    return data.exists ?? false;
  } catch (e) {
    console.error('Ошибка доступа Telegram:', e.message);
    return false;
  }
}
