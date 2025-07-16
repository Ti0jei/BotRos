import dotenv from 'dotenv';
dotenv.config();

import { Telegraf, Markup } from 'telegraf';
import fetch from 'node-fetch';
import { OpenAI } from 'openai';
import { notifyTelegramTraining } from './utils/notifyTelegramTraining.mjs';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;
const API_URL = process.env.API_BASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TOKEN || !WEB_APP_URL || !API_URL || !OPENAI_API_KEY) {
  console.warn('❌ Missing environment variables');
  process.exit(1);
}

const bot = new Telegraf(TOKEN);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export { bot }; // экспортируем для внешнего использования

const greetingSent = new Set();
const dailyLimits = new Map();
const aiContexts = new Map();

function autoDelete(ctx, message, delay = 3000) {
  setTimeout(() => {
    ctx.telegram.deleteMessage(ctx.chat.id, message.message_id).catch(() => {});
  }, delay);
}

async function onlyRegistered(ctx, next) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return ctx.reply('⚠️ Не удалось определить Telegram ID');

  try {
    const res = await fetch(`${API_URL}/api/auth/check-telegram?telegramId=${telegramId}`);
    const { exists } = await res.json();

    if (!exists) {
      const msg = await ctx.reply('❌ У вас нет доступа. Зарегистрируйтесь через приложение.', {
        reply_markup: {
          inline_keyboard: [[{ text: '📱 Открыть приложение', web_app: { url: `${WEB_APP_URL}?tid=${telegramId}` } }]]
        }
      });
      autoDelete(ctx, msg, 3000);
      return;
    }

    return next();
  } catch (e) {
    const errorMsg = await ctx.reply('⚠️ Ошибка при проверке доступа.');
    autoDelete(ctx, errorMsg);
  }
}

async function showMenu(ctx) {
  const telegramId = ctx.from?.id;
  const name = ctx.from?.first_name || 'Гость';
  aiContexts.delete(telegramId);
  const sent = await ctx.reply(`👋 ${name}, выбери действие ниже:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📱 Открыть приложение', web_app: { url: `${WEB_APP_URL}?tid=${telegramId}` } }],
        [{ text: '🤖 Рекомендации по питанию', callback_data: 'ai_nutrition' }],
        [{ text: '📞 Задать вопрос', url: 'https://t.me/krippsii' }]
      ]
    }
  });
  autoDelete(ctx, sent, 180000);
}

bot.start(async (ctx) => {
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username || '';
  const startMessageId = ctx.message?.message_id;
  if (!telegramId) return ctx.reply('⚠️ Не удалось получить Telegram ID');

  try {
    const check = await fetch(`${API_URL}/api/auth/check-telegram?telegramId=${telegramId}`);
    const { exists } = await check.json();

    if (!exists) {
      await fetch(`${API_URL}/api/auth/telegram-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, username })
      });

      const msg = await ctx.reply('❌ У вас нет доступа. Зарегистрируйтесь через приложение.', {
        reply_markup: {
          inline_keyboard: [[{ text: '📱 Открыть приложение', web_app: { url: `${WEB_APP_URL}?tid=${telegramId}` } }]]
        }
      });
      if (startMessageId) ctx.telegram.deleteMessage(ctx.chat.id, startMessageId).catch(() => {});
      autoDelete(ctx, msg, 3000);
      return;
    }

    if (startMessageId) ctx.telegram.deleteMessage(ctx.chat.id, startMessageId).catch(() => {});

    if (!greetingSent.has(telegramId)) {
      await ctx.reply('Если будут вопросы — просто напиши сюда 💬', Markup.keyboard([['📋 Меню']]).resize());
      greetingSent.add(telegramId);
    } else {
      await ctx.reply('📋 Меню доступно снизу ⬇️', Markup.keyboard([['📋 Меню']]).resize());
    }
  } catch (e) {
    const fail = await ctx.reply('⚠️ Ошибка при проверке доступа.');
    autoDelete(ctx, fail);
  }
});

bot.hears('📋 Меню', onlyRegistered, async (ctx) => {
  try {
    await ctx.deleteMessage(ctx.message.message_id);
  } catch (_) {}
  await showMenu(ctx);
});

bot.command('menu', onlyRegistered, showMenu);

bot.on('message', async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return next?.();

  if (!greetingSent.has(telegramId)) {
    await ctx.reply('👋 Привет! Чтобы начать, нажми кнопку 📋 Меню снизу.', Markup.keyboard([['📋 Меню']]).resize());
    greetingSent.add(telegramId);
  }

  if (!aiContexts.has(telegramId)) {
    await ctx.reply('📋 Меню доступно снизу ⬇️', Markup.keyboard([['📋 Меню']]).resize());
  }

  return next?.();
});

bot.action('ai_nutrition', onlyRegistered, async (ctx) => {
  await ctx.answerCbQuery();
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const today = new Date().toISOString().slice(0, 10);
  const usage = dailyLimits.get(telegramId);

  if (usage?.date === today && usage.count >= 3) {
    const msg = await ctx.reply('❗Ты уже использовал лимит из 3 запросов на сегодня.');
    aiContexts.delete(telegramId);
    autoDelete(ctx, msg);
    return;
  }

  aiContexts.set(telegramId, {
    messages: [{
      role: 'system',
      content: 'Ты — диетолог и консультант по питанию. Отвечай на вопросы о продуктах, составе и здоровом питании. Игнорируй нееду.'
    }],
    lastUsed: Date.now(),
  });

  const sent = await ctx.reply('🧠 Напиши, что ты хочешь узнать по питанию (до 300 символов).');
  autoDelete(ctx, sent, 180000);
});

bot.hears(/^(.{1,300})$/, onlyRegistered, async (ctx) => {
  const telegramId = ctx.from?.id;
  const msg = ctx.message.text;
  if (!telegramId || !aiContexts.has(telegramId)) return;

  const today = new Date().toISOString().slice(0, 10);
  let usage = dailyLimits.get(telegramId) || { date: today, count: 0 };

  if (usage.date !== today) usage = { date: today, count: 0 };
  if (usage.count >= 3) {
    const reply = await ctx.reply('❗Лимит 3 запроса в день исчерпан.');
    aiContexts.delete(telegramId);
    autoDelete(ctx, reply);
    return;
  }

  usage.count += 1;
  dailyLimits.set(telegramId, usage);

  const context = aiContexts.get(telegramId);
  context.lastUsed = Date.now();
  context.messages.push({ role: 'user', content: msg });

  const thinking = await ctx.reply('⌛ Думаю...');
  autoDelete(ctx, thinking);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: context.messages,
      max_tokens: 300
    });

    const replyText = completion.choices[0]?.message?.content || '❌ Не удалось получить ответ.';
    context.messages.push({ role: 'assistant', content: replyText });

    const questionMessageId = ctx.message.message_id;
    const answer = await ctx.reply(replyText);
    const reminder = await ctx.reply('🔄 Вы можете задать ещё один вопрос, или нажмите 📋 Меню, чтобы выйти.');

    setTimeout(() => {
      ctx.telegram.deleteMessage(ctx.chat.id, questionMessageId).catch(() => {});
      ctx.telegram.deleteMessage(ctx.chat.id, answer.message_id).catch(() => {});
      ctx.telegram.deleteMessage(ctx.chat.id, reminder.message_id).catch(() => {});
      aiContexts.delete(telegramId);
    }, 180000);
  } catch (err) {
    const fail = await ctx.reply('❌ Ошибка при обращении к ИИ. Попробуй позже.');
    autoDelete(ctx, fail);
  }
});

bot.action(/^attend:(.+)$/, async (ctx) => {
  const trainingId = ctx.match[1];
  await ctx.answerCbQuery('✅ Вы отметились как "Буду"');
  await ctx.editMessageText('✅ Вы подтвердили участие в тренировке.');

  try {
    await fetch(`${API_URL}/api/trainings/${trainingId}/attended`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attended: true, wasCounted: true })
    });
  } catch (e) {
    console.warn('❌ Ошибка при подтверждении участия:', e.message);
  }
});

bot.action(/^decline:(.+)$/, async (ctx) => {
  const trainingId = ctx.match[1];
  await ctx.answerCbQuery('❌ Вы отказались от участия');
  await ctx.editMessageText('❌ Вы отказались от участия в тренировке.');
});

setInterval(() => {
  const now = Date.now();
  for (const [userId, ctx] of aiContexts.entries()) {
    if (now - ctx.lastUsed > 10 * 60 * 1000) {
      aiContexts.delete(userId);
    }
  }
}, 60000);

export async function notifySectionUnlocked(telegramId, sectionName) {
  const msg = `Раздел *${sectionName}* теперь доступен! Проверь приложение 👀`;
  try {
    const sent = await bot.telegram.sendMessage(telegramId, msg, { parse_mode: 'Markdown' });
    setTimeout(() => {
      bot.telegram.deleteMessage(telegramId, sent.message_id).catch(() => {});
    }, 48 * 3600 * 1000);
  } catch (err) {
    console.warn('❌ Не удалось отправить уведомление:', err.message);
  }
}

bot.catch((err, ctx) => {
  console.error('❌ Unhandled error for update', ctx.update, err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch().then(() => {
  console.log('🤖 Бот успешно запущен');
  bot.telegram.setMyCommands([]);
});
