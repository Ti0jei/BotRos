const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

/**
 * Отправляет уведомление в Telegram (с кнопками — только если передан trainingId)
 * @param {string} telegramId - ID пользователя в Telegram
 * @param {string} text - Текст сообщения
 * @param {string|null} trainingId - ID тренировки для кнопок (опционально)
 */
export async function notifyTelegram(telegramId, text, trainingId = null) {
  if (!telegramId || !TOKEN) {
    console.warn('❗ notifyTelegram: нет telegramId или TELEGRAM_BOT_TOKEN');
    return;
  }

  const payload = {
    chat_id: telegramId,
    text,
  };

  // если передан trainingId — добавляем кнопки
  if (trainingId) {
    payload.reply_markup = {
      inline_keyboard: [
        [
          { text: '✅ Буду', callback_data: `attend:${trainingId}` },
          { text: '❌ Не буду', callback_data: `decline:${trainingId}` }
        ]
      ]
    };
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error('❌ Telegram API ошибка:', data);
    } else {
      console.log(`✅ Уведомление отправлено${trainingId ? ' с кнопками' : ''}:`, telegramId);
    }
  } catch (err) {
    console.error('❌ Ошибка отправки уведомления:', err.message);
  }
}
