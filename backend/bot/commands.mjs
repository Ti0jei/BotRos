import { Markup } from 'telegraf';
import { isRegistered } from './middleware.mjs';
import { showMainMenu } from './handlers.mjs';

/**
 * Настраивает команды и поведение меню
 * @param {Telegraf} bot
 */
export function setupCommands(bot) {
  // Команда /start
  bot.start(isRegistered, async (ctx) => {
    await ctx.reply('👋 Добро пожаловать!');
    await showMainMenu(ctx);
  });

  // Команда /menu
  bot.command('menu', isRegistered, async (ctx) => {
    await showMainMenu(ctx);
  });

  // Команда /testme
  bot.command('testme', isRegistered, async (ctx) => {
    const tgId = ctx.from?.id;
    const username = ctx.from?.username || ctx.from?.first_name || 'пользователь';

    await ctx.reply(`✅ Бот работает!\nТвой Telegram ID: ${tgId}\nИмя: ${username}`);
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

    // 💡 Если пользователь сейчас в процессе рассылки — не мешаем
    if (ctx.session?.notifyState?.step === 'awaiting_text') {
      return next?.();
    }

    // AI-мод — не мешаем
    const { aiContexts } = await import('./ai.mjs');
    const inAiMode = aiContexts.has(telegramId);

    if (!inAiMode) {
      await ctx.reply('📋 Меню доступно снизу ⬇️', Markup.keyboard([['📋 Меню']]).resize());
    }

    return next?.();
  });
}
