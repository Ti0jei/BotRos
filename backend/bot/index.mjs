import dotenv from 'dotenv';
dotenv.config();

import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
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

// ✅ Подключаем устойчивые сессии (сохраняются в файл session.json)
const localSession = new LocalSession({
  database: 'session.json',
  storage: LocalSession.storageFileAsync,
});
bot.use(localSession.middleware());

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 📦 Подключаем модули
import { setupCommands } from './commands.mjs';
import { setupAiFeatures } from './ai.mjs';
import { setupNewsNotification } from './newsNotify.mjs';
import { setupHandlers } from './handlers.mjs';

// ⚙️ Инициализация
setupCommands(bot);
setupAiFeatures(bot);
setupNewsNotification(bot);
setupHandlers(bot);

// 🛡️ Отлов ошибок
bot.catch((err, ctx) => {
  console.error('❌ Unhandled error for update', ctx.update, err);
});

// 🚀 Запуск бота
bot.launch().then(() => {
  console.log('🤖 Бот успешно запущен');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
