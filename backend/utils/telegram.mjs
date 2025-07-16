const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

export async function notifyTelegram(telegramId, text) {
  if (!telegramId || !TOKEN) {
    console.warn('❗ notifyTelegram: нет telegramId или TELEGRAM_BOT_TOKEN');
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error('❌ Telegram API ошибка:', data);
    } else {
      console.log('✅ Уведомление отправлено:', telegramId);
    }
  } catch (err) {
    console.error('❌ Ошибка отправки уведомления:', err.message);
  }
}
