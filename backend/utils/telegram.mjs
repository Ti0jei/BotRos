import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

export async function notifyTelegram(telegramId, message) {
  if (!telegramId || !TOKEN) {
    console.warn('❗ notifyTelegram: отсутствует telegramId или токен');
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error('❌ Telegram API error:', data);
    } else {
      console.log('✅ Уведомление отправлено пользователю:', telegramId);
    }
  } catch (err) {
    console.error('❌ Ошибка при отправке уведомления:', err);
  }
}
