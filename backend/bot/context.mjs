// bot/context.mjs

/**
 * Временное хранилище для сессий пользователей
 * Используется, например, при создании новостной рассылки
 */

const userSessions = new Map();

/**
 * Получить сессию для Telegram ID
 * @param {number} telegramId
 * @returns {object}
 */
export function getSession(telegramId) {
  if (!userSessions.has(telegramId)) {
    userSessions.set(telegramId, {});
  }
  return userSessions.get(telegramId);
}

/**
 * Очистить сессию
 * @param {number} telegramId
 */
export function clearSession(telegramId) {
  userSessions.delete(telegramId);
}
