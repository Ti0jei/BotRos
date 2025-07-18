import { Markup } from 'telegraf';
import { WEB_APP_URL, API_URL } from './index.mjs';
import { aiContexts } from './ai.mjs';
import { clearSession } from './context.mjs';
import { isRegistered } from './middleware.mjs';
import fetch from 'node-fetch';

const newsContexts = new Map(); // Для хранения состояния рассылки

export async function showMainMenu(ctx) {
  const telegramId = ctx.from?.id;
  const name = ctx.from?.first_name || 'Гость';

  aiContexts.delete(telegramId);
  clearSession(telegramId);
  newsContexts.delete(telegramId);

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

  // Новостная рассылка — начало
  bot.action('notify_start', isRegistered, async (ctx) => {
    const role = ctx.state?.user?.role;
    const telegramId = ctx.from?.id;

    if (role !== 'ADMIN') return ctx.answerCbQuery('⛔ Нет доступа');

    newsContexts.set(telegramId, true);
    await ctx.answerCbQuery();
    await ctx.reply('📝 Введите текст новости, которую хотите разослать всем пользователям.');
  });

  // Обработка текста новости
  bot.on('text', isRegistered, async (ctx) => {
    const telegramId = ctx.from?.id;
    const token = ctx.state?.token;

    // Если админ вводит новость
    if (newsContexts.has(telegramId)) {
      const newsText = ctx.message.text;

      try {
        const res = await fetch(`${API_URL}/api/admin/notify`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newsText }),
        });

        if (!res.ok) throw new Error('Ошибка отправки');

        await ctx.reply('📬 Рассылка отправлена ✅');
      } catch (err) {
        console.error('Ошибка рассылки:', err.message);
        await ctx.reply('❌ Не удалось отправить рассылку');
      } finally {
        newsContexts.delete(telegramId);
      }
      return;
    }

    // Сообщение вне AI и вне новостной рассылки
    if (!aiContexts.has(telegramId)) {
      await ctx.reply('📋 Меню доступно снизу ⬇️', Markup.keyboard([['📋 Меню']]).resize());
    }
  });

  // Кнопка "✅ Буду"
  bot.action(/^attend:(.+)$/, isRegistered, async (ctx) => {
    const trainingId = ctx.match[1];
    const token = ctx.state?.token;

    try {
      await fetch(`${API_URL}/api/trainings/${trainingId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      await ctx.answerCbQuery('✅ Статус обновлён');
      await ctx.reply('🟢 Отлично! Вы придёте на тренировку');
    } catch (err) {
      console.error('❌ Ошибка обновления статуса:', err.message);
      await ctx.answerCbQuery('⚠️ Ошибка');
      await ctx.reply('⚠️ Не удалось обновить статус. Попробуйте позже.');
    }
  });

  // Кнопка "❌ Не буду"
  bot.action(/^decline:(.+)$/, isRegistered, async (ctx) => {
    const trainingId = ctx.match[1];
    const token = ctx.state?.token;

    try {
      await fetch(`${API_URL}/api/trainings/${trainingId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'DECLINED' }),
      });

      await ctx.answerCbQuery('❌ Статус обновлён');
      await ctx.reply('🔴 Окей! Мы учтём, что вы не придёте');
    } catch (err) {
      console.error('❌ Ошибка обновления статуса:', err.message);
      await ctx.answerCbQuery('⚠️ Ошибка');
      await ctx.reply('⚠️ Не удалось обновить статус. Попробуйте позже.');
    }
  });
}
