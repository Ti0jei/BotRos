// bot/admin.mjs

import { Markup } from 'telegraf';
import { isAdmin } from './middleware.mjs';
import { notifyAllClients, notifyAllAdmins } from './notifications.mjs';

/**
 * Обработка команды рассылки от админа
 */
export function setupAdminCommands(bot) {
  bot.command('notify', isAdmin, async (ctx) => {
    await ctx.reply('Кому отправим?', {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('👥 Всем', 'notify_all')],
        [Markup.button.callback('🛠 Только админам', 'notify_admins')],
      ]),
    });
  });

  bot.action('notify_all', isAdmin, async (ctx) => {
    ctx.session = { notifyTarget: 'all' };
    await ctx.editMessageText('✏️ Напиши текст рассылки для всех пользователей:');
  });

  bot.action('notify_admins', isAdmin, async (ctx) => {
    ctx.session = { notifyTarget: 'admins' };
    await ctx.editMessageText('✏️ Напиши текст рассылки только для админов:');
  });

  bot.on('text', isAdmin, async (ctx, next) => {
    const target = ctx.session?.notifyTarget;
    if (!target) return next();

    const text = ctx.message.text;
    if (!text || text.length < 3) {
      return ctx.reply('⚠️ Текст слишком короткий.');
    }

    if (target === 'all') {
      await notifyAllClients(text);
      await ctx.reply('✅ Рассылка отправлена всем пользователям.');
    }

    if (target === 'admins') {
      await notifyAllAdmins(text);
      await ctx.reply('✅ Рассылка отправлена только админам.');
    }

    delete ctx.session.notifyTarget;
  });
}
