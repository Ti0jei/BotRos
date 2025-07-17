// bot/handlers.mjs

import { Markup } from 'telegraf';
import { WEB_APP_URL } from './index.mjs';
import { aiContexts } from './ai.mjs';
import { clearSession } from './context.mjs';
import { isRegistered } from './middleware.mjs';

export async function showMainMenu(ctx) {
  const telegramId = ctx.from?.id;
  const name = ctx.from?.first_name || 'Гость';

  aiContexts.delete(telegramId);
  clearSession(telegramId);

  const role = ctx.state?.user?.role;

  const keyboard = [
    [{ text: '📱 Открыть приложение', web_app: { url: `${WEB_APP_URL}?tid=${telegramId}` } }],
    [{ text: '🤖 Рекомендации по питанию', callback_data: 'ai_nutrition' }],
  ];

  if (role === 'ADMIN') {
    keyboard.push([{ text: '📰 Новостная рассылка', callback_data: 'notify_start' }]);
  } else {
    keyboard.push([{ text: '📞 Задать вопрос', url: 'https://t.me/krippsii' }]);
  }

  await ctx.reply(`👋 ${name}, выбери действие ниже:`, {
    reply_markup: { inline_keyboard: keyboard },
  });
}

export function setupHandlers(bot) {
  // Главное меню
  bot.command('menu', isRegistered, showMainMenu);

  bot.hears('📋 Меню', isRegistered, async (ctx) => {
    try {
      await ctx.deleteMessage(ctx.message.message_id);
    } catch (_) {}
    await showMainMenu(ctx);
  });

  // Кнопки подтверждения участия
  bot.action(/^attend:(.+)$/, isRegistered, async (ctx) => {
    const trainingId = ctx.match[1];
    await ctx.answerCbQuery('✅ Вы подтвердили участие');
    await ctx.reply(`🟢 Отлично! Вы придёте на тренировку (ID: ${trainingId})`);
  });

  bot.action(/^decline:(.+)$/, isRegistered, async (ctx) => {
    const trainingId = ctx.match[1];
    await ctx.answerCbQuery('❌ Вы отказались от участия');
    await ctx.reply(`🔴 Окей! Мы учтём, что вы не придёте (ID: ${trainingId})`);
  });

  // Сообщения вне контекста AI
  bot.on('message', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    if (!aiContexts.has(telegramId)) {
      await ctx.reply('📋 Меню доступно снизу ⬇️', Markup.keyboard([['📋 Меню']]).resize());
    }
  });
}
