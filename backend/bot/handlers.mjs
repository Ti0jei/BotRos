import { Markup } from 'telegraf';
import { WEB_APP_URL } from './index.mjs';
import { aiContexts } from './ai.mjs';
import { clearSession } from './context.mjs';

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
  bot.hears('📋 Меню', async (ctx) => {
    try {
      await ctx.deleteMessage(ctx.message.message_id);
    } catch (_) {}
    await showMainMenu(ctx);
  });

  bot.command('menu', async (ctx) => {
    await showMainMenu(ctx);
  });

  bot.on('message', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    if (!aiContexts.has(telegramId)) {
      await ctx.reply('📋 Меню доступно снизу ⬇️', Markup.keyboard([['📋 Меню']]).resize());
    }
  });
}
