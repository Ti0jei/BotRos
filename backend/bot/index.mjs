// bot/index.mjs

import dotenv from 'dotenv';
dotenv.config();

import { Telegraf, Markup } from 'telegraf';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';

import { setupHandlers } from './handlers.mjs';

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

// Основной запуск
setupHandlers(bot);

bot.catch((err, ctx) => {
  console.error('❌ Unhandled error for update', ctx.update, err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch().then(() => {
  console.log('🤖 Бот успешно запущен');
});
