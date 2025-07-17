// bot/newsNotify.mjs

import { Markup } from 'telegraf';
import { isRegistered } from './middleware.mjs';
import { notifyAllUsers } from './notifications.mjs'; // ✅ Исправлен путь

const notifyStates = new Map();

/**
 * Настройка механизма новостной рассылки для админов
 * @param {Telegraf} bot
 */
export function setupNewsNotification(bot) {
  // Старт рассылки
  bot.action('notify_start', isRegistered, async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    notifyStates.set(telegramId, { step: 'awaiting_text' });
    await ctx.answerCbQuery('✅');
    await ctx.reply('📝 Введите текст новости, которую хотите разослать всем пользователям.');
  });

  // Ввод текста
  bot.on('text', isRegistered, async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId || !notifyStates.has(telegramId)) return;

    const state = notifyStates.get(telegramId);
    if (state.step !== 'awaiting_text') return;

    const message = ctx.message.text.trim();
    if (message.length < 10) {
      return ctx.reply('⚠️ Текст слишком короткий. Введите минимум 10 символов.');
    }

    state.text = message;
    state.step = 'awaiting_confirm';

    await ctx.reply(`📨 Вот что вы хотите отправить:\n\n${state.text}`, Markup.inlineKeyboard([
      Markup.button.callback('✅ Подтвердить', 'notify_confirm'),
      Markup.button.callback('❌ Отменить', 'notify_cancel'),
    ]));
  });

  // Подтверждение рассылки
  bot.action('notify_confirm', isRegistered, async (ctx) => {
    const telegramId = ctx.from?.id;
    const state = notifyStates.get(telegramId);
    if (!state?.text) return;

    await ctx.answerCbQuery('🚀');
    await ctx.reply('🚀 Рассылаю...');

    try {
      const result = await notifyAllUsers(state.text);
      notifyStates.delete(telegramId);
      await ctx.reply(`✅ Готово! Уведомления отправлены ${result.success}/${result.total} пользователям.`);
    } catch (err) {
      console.error('❌ Ошибка при рассылке:', err);
      notifyStates.delete(telegramId);
      await ctx.reply('❌ Произошла ошибка при рассылке.');
    }
  });

  // Отмена рассылки
  bot.action('notify_cancel', isRegistered, async (ctx) => {
    const telegramId = ctx.from?.id;
    notifyStates.delete(telegramId);
    await ctx.answerCbQuery('❌');
    await ctx.reply('❌ Рассылка отменена.');
  });
}
