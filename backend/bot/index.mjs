import dotenv from 'dotenv';
dotenv.config();

import { Telegraf, session } from 'telegraf';
import { OpenAI } from 'openai';

export const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const API_URL = process.env.API_BASE_URL;
export const WEB_APP_URL = process.env.WEB_APP_URL;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TOKEN || !API_URL || !WEB_APP_URL || !OPENAI_API_KEY) {
  console.warn('❌ Отсутствуют обязательные переменные окружения');
  process.exit(1);
}

export const bot = new Telegraf(TOKEN);

// 🧠 ВАЖНО: session() — ДО любых setup-хендлеров
bot.use(session());

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 📦 Модули подключаем только после session
import { setupCommands } from './commands.mjs';
import { setupAiFeatures } from './ai.mjs';
import { setupNewsNotification } from './newsNotify.mjs';
import { setupHandlers } from './handlers.mjs';

// Подключение функционала
setupCommands(bot);
setupAiFeatures(bot);
setupNewsNotification(bot);
setupHandlers(bot);

// 🛡️ Глобальный catcher
bot.catch((err, ctx) => {
  console.error('❌ Unhandled error for update', ctx.update, err);
});

// 🚀 Запуск
bot.launch().then(() => {
  console.log('🤖 Бот успешно запущен');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
