import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;
const API_URL = process.env.API_BASE_URL || 'https://botros-qrra.onrender.com';

if (!TOKEN || !WEB_APP_URL) {
  console.error('❌ TELEGRAM_BOT_TOKEN или WEB_APP_URL не указаны в .env');
  process.exit(1);
}

const bot = new Telegraf(TOKEN);

bot.start(async (ctx) => {
  const telegramId = ctx.from.id;
  const username = ctx.from.username || '';

  // 🔁 Отправляем telegramId на backend (необязательно, но можно оставить)
  try {
    await fetch(`${API_URL}/api/auth/telegram-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, username }),
    });
    console.log(`✅ Telegram ID ${telegramId} отправлен на backend`);
  } catch (e) {
    console.error('❌ Ошибка при отправке telegramId:', e);
  }

  // 🟢 Отправляем кнопку с tid-параметром
  ctx.reply('Нажми, чтобы открыть мини-приложение 👇', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть приложение',
            web_app: {
              url: `${WEB_APP_URL}?tid=${telegramId}`,
            },
          },
        ],
      ],
    },
  });
});

bot.launch();
console.log('🤖 Бот запущен и готов принимать пользователей');
