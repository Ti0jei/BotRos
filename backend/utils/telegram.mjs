import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

export async function notifyTelegram(telegramId, text) {
  if (!telegramId) {
    console.warn('❗ Нет telegramId для отправки уведомления');
    return;
  }

  try {
    await bot.telegram.sendMessage(telegramId, text);
    console.log(`✅ Уведомление отправлено: ${telegramId}`);
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения:', error.response?.description || error.message);
  }
}
