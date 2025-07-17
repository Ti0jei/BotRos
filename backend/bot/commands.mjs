import { Markup } from 'telegraf';
import { isRegistered } from './middleware.mjs';
import { showMainMenu } from './handlers.mjs';

/**
 * Настраивает команды и поведение меню
 * @param {Telegraf} bot
 */
export function setupCommands(bot) {
  // Команда /menu
  bot.command('menu', isRegistered, async (ctx) => {
    await showMainMenu(ctx);
  });

  // Кнопка 📋 Меню
  bot.hears('📋 Меню', isRegistered, async (ctx) => {
    try {
      if (ctx.message?.message_id) {
        await ctx.deleteMessage(ctx.message.message_id).catch(() => {});
      }
    } catch (_) {}
    await showMainMenu(ctx);
  });

  // Все прочие сообщения
  bot.on('message', isRegistered, async (ctx, next) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const { aiContexts } = await import('./ai.mjs');
    const inAiMode = aiContexts.has(telegramId);

    if (!inAiMode) {
      await ctx.reply('📋 Меню доступно снизу ⬇️', Markup.keyboard([['📋 Меню']]).resize());
    }

    return next?.();
  });
}
