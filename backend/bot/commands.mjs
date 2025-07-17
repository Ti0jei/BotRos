// bot/commands.mjs

import { Markup } from 'telegraf';
import { isRegistered } from './middleware.mjs';
import { showMainMenu } from './handlers.mjs';

export function setupCommands(bot) {
  bot.command('menu', isRegistered, showMainMenu);

  bot.hears('📋 Меню', isRegistered, async (ctx) => {
    try {
      await ctx.deleteMessage(ctx.message.message_id);
    } catch (_) {}
    await showMainMenu(ctx);
  });

  bot.on('message', async (ctx, next) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return next?.();

    await ctx.reply('📋 Меню доступно снизу ⬇️', Markup.keyboard([['📋 Меню']]).resize());
    return next?.();
  });
}
