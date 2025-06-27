const lastActivity = new Map();

export function shouldNotify(telegramId) {
  const now = Date.now();
  const last = lastActivity.get(telegramId) || 0;
  if (now - last < 300_000) return false; // 5 минут
  lastActivity.set(telegramId, now);
  return true;
}
