import dotenv from 'dotenv';
dotenv.config();

import { Telegraf } from 'telegraf';
import { OpenAI } from 'openai';

import { setupCommands } from './commands.mjs';           // 📋 Главное меню и команды
import { setupAiFeatures } from './ai.mjs';                // 🤖 ИИ-питание
import { setupNewsNotification } from './newsNotify.mjs';  // 📰 Новостная рассылка
import { setupHandlers } from './handlers.mjs';            // ✅ Обработчики кнопок (attend / decline)

export const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const API_URL = process.env.API_BASE_URL;
export const WEB_APP_URL = process.env.WEB_APP_URL;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TOKEN || !API_URL || !WEB_APP_URL || !OPENAI_API_KEY) {
  console.warn('❌ Отсутствуют обязательные переменные окружения');
  process.exit(1);
}

export const bot = new Telegraf(TOKEN);
export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Основные фичи
setupCommands(bot);              // 📋 Главное меню и команды
setupAiFeatures(bot);           // 🤖 ИИ-питание
setupNewsNotification(bot);     // 📰 Новостная рассылка
setupHandlers(bot);             // ✅ Важно: подключаем обработку inline-кнопок

// Ловим необработанные ошибки
bot.catch((err, ctx) => {
  console.error('❌ Unhandled error for update', ctx.update, err);
});

// Выход по сигналам
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Старт
bot.launch().then(() => {
  console.log('🤖 Бот успешно запущен');
});
