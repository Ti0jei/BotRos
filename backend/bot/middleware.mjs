// backend/bot/middleware.mjs
import fetch from 'node-fetch';
import { API_URL, WEB_APP_URL } from './index.mjs';

/**
 * Middleware для проверки регистрации пользователя
 */
export async function isRegistered(ctx, next) {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.reply('⚠️ Не удалось определить Telegram ID');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/check-telegram?telegramId=${telegramId}`);

    if (!res.ok) {
      throw new Error(`Сервер вернул ${res.status}`);
    }

    const { exists, user, token } = await res.json();

    if (!exists) {
      const msg = await ctx.reply('❌ У вас нет доступа. Зарегистрируйтесь через приложение.', {
        reply_markup: {
          inline_keyboard: [[
            { text: '📱 Открыть приложение', web_app: { url: `${WEB_APP_URL}?tid=${telegramId}` } }
          ]]
        }
      });

      setTimeout(() => {
        ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id).catch(() => {});
      }, 3000);

      return; // ← ПРЕРЫВАЕМ выполнение
    }

    // ✅ Всё хорошо — сохраняем данные в ctx.state и продолжаем
    ctx.state ??= {};
    ctx.state.user = user;
    ctx.state.token = token;

    return await next(); // ← Важно
  } catch (e) {
    console.error('❌ isRegistered error:', e);
    const fail = await ctx.reply('⚠️ Ошибка при проверке доступа.');
    setTimeout(() => {
      ctx.telegram.deleteMessage(ctx.chat.id, fail.message_id).catch(() => {});
    }, 3000);
  }
}
