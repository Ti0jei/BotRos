// lib/antiSpam.mjs

// Отдельно храним для тренера и для пользователя
const trainerNotifyMap = new Map();
const userNotifyMap = new Map();

/**
 * Проверка: можно ли отправить уведомление тренеру (антиспам 5 минут)
 * @param {string} telegramId
 * @returns {boolean}
 */
export function shouldNotifyTrainer(telegramId) {
  const now = Date.now();
  const last = trainerNotifyMap.get(telegramId) || 0;
  if (now - last < 5 * 60 * 1000) return false;
  trainerNotifyMap.set(telegramId, now);
  return true;
}

/**
 * Проверка: можно ли отправить уведомление пользователю (антиспам 5 секунд)
 * @param {string} telegramId
 * @returns {boolean}
 */
export function shouldNotifyUser(telegramId) {
  const now = Date.now();
  const last = userNotifyMap.get(telegramId) || 0;
  if (now - last < 5000) return false;
  userNotifyMap.set(telegramId, now);
  return true;
}
