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
    const url = `${API_URL}/api/auth/check-telegram?telegramId=${telegramId}`;
    console.log(`🔍 Проверка регистрации: ${url}`);

    const res = await fetch(url);

    if (!res.ok) {
      console.error(`❌ Ответ сервера: ${res.status}`);
      throw new Error(`Ошибка fetch: ${res.status}`);
    }

    const json = await res.json();

    if (!json?.exists || !json?.user) {
      console.warn(`⚠️ Пользователь не найден: ${telegramId}`);

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

      return;
    }

    // ✅ Всё успешно
    ctx.state ??= {};
    ctx.state.user = json.user;
    ctx.state.token = json.token;

    console.log(`✅ Доступ разрешён: ${json.user.name} (${json.user.role})`);

    return await next();
  } catch (e) {
    console.error('❌ Ошибка isRegistered:', e.message);
    const fail = await ctx.reply('⚠️ Ошибка при проверке доступа.');
    setTimeout(() => {
      ctx.telegram.deleteMessage(ctx.chat.id, fail.message_id).catch(() => {});
    }, 3000);
  }
}
