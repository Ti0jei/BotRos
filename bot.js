import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

if (!TOKEN || !WEB_APP_URL) {
  console.error('❌ TELEGRAM_BOT_TOKEN или WEB_APP_URL не указаны в .env');
  process.exit(1);
}

const bot = new Telegraf(TOKEN);

bot.start((ctx) => {
  ctx.reply('Привет! Нажми кнопку ниже, чтобы открыть мини-приложение 👇', {
    reply_markup: {
      keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: WEB_APP_URL } }],
      ],
      resize_keyboard: true,
      is_persistent: true,
    },
  });
});

bot.on('message', (ctx) => {
  ctx.reply('Вот кнопка для входа в мини-приложение 👇', {
    reply_markup: {
      keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: WEB_APP_URL } }],
      ],
      resize_keyboard: true,
      is_persistent: true,
    },
  });
});

bot.launch();
console.log('🤖 Бот запущен. Ждёт входящих сообщений...');
