import { Markup } from 'telegraf';
import { isRegistered } from './middleware.mjs';
import { notifyBroadcast } from '../utils/broadcast.mjs'; // 📦 Рассылка

/**
 * Настройка механизма новостной рассылки для админов
 * @param {Telegraf} bot
 */
export function setupNewsNotification(bot) {
  // Старт: выбор получателей
  bot.action('notify_start', isRegistered, async (ctx) => {
    ctx.session.notifyState = { step: 'choose_role' };

    await ctx.answerCbQuery('✅');
    await ctx.reply('Кому отправить рассылку?', Markup.inlineKeyboard([
      [Markup.button.callback('👥 Пользователям', 'notify_to_users')],
      [Markup.button.callback('👑 Администраторам', 'notify_to_admins')],
    ]));
  });

  // Выбор: пользователи
  bot.action('notify_to_users', isRegistered, async (ctx) => {
    const state = ctx.session?.notifyState;
    if (!state || state.step !== 'choose_role') return;

    state.role = 'USER';
    state.step = 'awaiting_text';

    await ctx.answerCbQuery();
    await ctx.reply('📝 Введите текст новости для пользователей:');
  });

  // Выбор: админы
  bot.action('notify_to_admins', isRegistered, async (ctx) => {
    const state = ctx.session?.notifyState;
    if (!state || state.step !== 'choose_role') return;

    state.role = 'ADMIN';
    state.step = 'awaiting_text';

    await ctx.answerCbQuery();
    await ctx.reply('📝 Введите текст новости для администраторов:');
  });

  // Ввод текста
  bot.on('text', isRegistered, async (ctx, next) => {
    const state = ctx.session?.notifyState;

    if (!state || state.step !== 'awaiting_text') return next(); // передаём другим хендлерам

    const message = ctx.message.text.trim();
    if (message.length < 10) {
      return ctx.reply('⚠️ Текст слишком короткий. Введите минимум 10 символов.');
    }

    state.text = message;
    state.step = 'awaiting_confirm';

    await ctx.reply(
      `📨 Вот что вы хотите отправить:\n\n${state.text}`,
      Markup.inlineKeyboard([
        Markup.button.callback('✅ Подтвердить', 'notify_confirm'),
        Markup.button.callback('❌ Отменить', 'notify_cancel'),
      ])
    );
  });

  // Подтверждение
  bot.action('notify_confirm', isRegistered, async (ctx) => {
    const state = ctx.session?.notifyState;

    if (!state?.text || !state?.role) return;

    await ctx.answerCbQuery('🚀');
    await ctx.reply('🚀 Рассылаю...');

    try {
      const result = await notifyBroadcast(state.text, state.role); // 📨
      delete ctx.session.notifyState;
      await ctx.reply(`✅ Готово! Уведомления отправлены ${result.success}/${result.total} (${state.role}).`);
    } catch (err) {
      console.error('❌ Ошибка при рассылке:', err);
      delete ctx.session.notifyState;
      await ctx.reply('❌ Произошла ошибка при рассылке.');
    }
  });

  // Отмена
  bot.action('notify_cancel', isRegistered, async (ctx) => {
    delete ctx.session.notifyState;
    await ctx.answerCbQuery('❌');
    await ctx.reply('❌ Рассылка отменена.');
  });
}
