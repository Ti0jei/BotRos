// bot/ai.mjs

import { Markup } from 'telegraf';
import { OpenAI } from 'openai';
import { isRegistered } from './middleware.mjs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const aiContexts = new Map();
const dailyLimits = new Map();

export function setupAiFeatures(bot) {
  bot.action('ai_nutrition', isRegistered, async (ctx) => {
    await ctx.answerCbQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const today = new Date().toISOString().slice(0, 10);
    const usage = dailyLimits.get(telegramId);

    if (usage?.date === today && usage.count >= 3) {
      await ctx.reply('❗Ты уже использовал лимит из 3 запросов на сегодня.');
      aiContexts.delete(telegramId);
      return;
    }

    aiContexts.set(telegramId, {
      messages: [{
        role: 'system',
        content: 'Ты — диетолог. Отвечай на вопросы о питании, здоровье и продуктах. Игнорируй несвязанные запросы.'
      }],
      lastUsed: Date.now(),
    });

    await ctx.reply('🧠 Напиши, что ты хочешь узнать по питанию (до 300 символов).');
  });

  bot.hears(/^(.{1,300})$/, isRegistered, async (ctx) => {
    const telegramId = ctx.from?.id;
    const msg = ctx.message.text;
    if (!telegramId || !aiContexts.has(telegramId)) return;

    const today = new Date().toISOString().slice(0, 10);
    let usage = dailyLimits.get(telegramId) || { date: today, count: 0 };

    if (usage.date !== today) usage = { date: today, count: 0 };
    if (usage.count >= 3) {
      await ctx.reply('❗Лимит 3 запроса в день исчерпан.');
      aiContexts.delete(telegramId);
      return;
    }

    usage.count += 1;
    dailyLimits.set(telegramId, usage);

    const context = aiContexts.get(telegramId);
    context.lastUsed = Date.now();
    context.messages.push({ role: 'user', content: msg });

    await ctx.reply('⌛ Думаю...');

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: context.messages,
        max_tokens: 300
      });

      const replyText = completion.choices[0]?.message?.content || '❌ Не удалось получить ответ.';
      context.messages.push({ role: 'assistant', content: replyText });

      await ctx.reply(replyText);
      await ctx.reply('🔄 Вы можете задать ещё один вопрос, или нажмите 📋 Меню, чтобы выйти.');

      setTimeout(() => aiContexts.delete(telegramId), 180000);
    } catch (err) {
      await ctx.reply('❌ Ошибка при обращении к ИИ.');
    }
  });

  setInterval(() => {
    const now = Date.now();
    for (const [userId, ctx] of aiContexts.entries()) {
      if (now - ctx.lastUsed > 10 * 60 * 1000) {
        aiContexts.delete(userId);
      }
    }
  }, 60000);
}

export { aiContexts };
