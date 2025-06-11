import fetch from 'node-fetch';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

export async function notifyTelegram(telegramId, message) {
  if (!telegramId || !TOKEN) return;

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: telegramId,
      text: message,
    }),
  });
}
