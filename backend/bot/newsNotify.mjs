// newsNotify.mjs

import { Markup } from 'telegraf';
import { isRegistered } from './middleware.mjs';
import { notifyBroadcast } from '../utils/broadcast.mjs';

/**
 * Настройка механизма новостной рассылки
 * @param {Telegraf} bot
 */
export function setupNewsNotification(bot) {
  // 🟢 Старт рассылки
  bot.action('notify_start', isRegistered, async (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.notifyState = { step: 'choose_role' };

    await ctx.answerCbQuery();
    await ctx.reply(
      'Кому отправить рассылку?',
      Markup.inlineKeyboard([
        [Markup.button.callback('👥 Пользователям', 'notify_to_users')],
        [Markup.button.callback('👑 Администраторам', 'notify_to_admins')],
      ])
    );
  });

  // 🟡 Выбор роли
  bot.action('notify_to_users', isRegistered, async (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.notifyState = { role: 'USER', step: 'awaiting_text' };

    await ctx.answerCbQuery();
    await ctx.reply('📝 Введите текст новости для пользователей:');
  });

  bot.action('notify_to_admins', isRegistered, async (ctx) => {
    ctx.session = ctx.session || {};
    ctx.session.notifyState = { role: 'ADMIN', step: 'awaiting_text' };

    await ctx.answerCbQuery();
    await ctx.reply('📝 Введите текст новости для администраторов:');
  });

  // 📝 Ввод текста
  bot.on('text', isRegistered, async (ctx, next) => {
    const state = ctx.session?.notifyState;
    console.log('🧪 notifyState:', state);

    if (!state || state.step !== 'awaiting_text') {
      return next?.();
    }

    const text = ctx.message.text.trim();
    if (text.length < 10) {
      return ctx.reply('⚠️ Текст слишком короткий. Минимум 10 символов.');
    }

    state.text = text;
    state.step = 'awaiting_confirm';

    await ctx.reply(
      `📨 Вот что вы хотите отправить:\n\n${text}`,
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Подтвердить', 'notify_confirm')],
        [Markup.button.callback('❌ Отменить', 'notify_cancel')],
      ])
    );
  });

  // ✅ Подтверждение
  bot.action('notify_confirm', isRegistered, async (ctx) => {
    const state = ctx.session?.notifyState;
    if (!state?.text || !state?.role) {
      return ctx.reply('⚠️ Нет данных. Запустите рассылку заново через /menu');
    }

    await ctx.answerCbQuery('🚀');

    // Удалить сообщение с кнопками
    if (ctx.callbackQuery?.message?.message_id) {
      await ctx.telegram.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id).catch(() => {});
    }

    await ctx.reply('🚀 Отправка сообщений...');

    try {
      const result = await notifyBroadcast(state.text, state.role);
      await ctx.reply(`✅ Готово! Отправлено ${result.success}/${result.total} (${state.role})`);
    } catch (err) {
      console.error('❌ Ошибка при рассылке:', err);
      await ctx.reply('❌ Ошибка при рассылке. Попробуйте позже.');
    }

    ctx.session.notifyState = undefined;
  });

  // ❌ Отмена
  bot.action('notify_cancel', isRegistered, async (ctx) => {
    ctx.session.notifyState = undefined;
    await ctx.answerCbQuery('❌');

    // Удалить сообщение с кнопками
    if (ctx.callbackQuery?.message?.message_id) {
      await ctx.telegram.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id).catch(() => {});
    }

    await ctx.reply('❌ Рассылка отменена.\nЧтобы начать заново, нажмите /menu');
  });
}
