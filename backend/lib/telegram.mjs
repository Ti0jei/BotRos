const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN не задан');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.warn('❗Ошибка отправки сообщения:', data);
    }
    return data;
  } catch (err) {
    console.error('❌ sendTelegramMessage failed:', err.message);
  }
}
