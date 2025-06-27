// lib/antiSpam.mjs

const lastActivity = new Map();

/**
 * Проверка: можно ли отправить уведомление?
 * @param {string} telegramId
 * @returns {boolean}
 */
export function shouldNotify(telegramId) {
  const now = Date.now();
  const last = lastActivity.get(telegramId) || 0;
  if (now - last < 5 * 60 * 1000) return false; // 5 минут
  lastActivity.set(telegramId, now);
  return true;
}
