const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

/**
 * Отправляет сообщение в Telegram с inline-кнопками ✅ / ❌
 * @param {string} telegramId - ID пользователя в Telegram
 * @param {string} text - Текст уведомления
 * @param {string} trainingId - ID тренировки (для кнопок)
 */
export async function notifyTelegram(telegramId, text, trainingId) {
  if (!telegramId || !TOKEN) {
    console.warn('❗ notifyTelegram: нет telegramId или TELEGRAM_BOT_TOKEN');
    return;
  }

  const payload = {
    chat_id: telegramId,
    text,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✅ Буду',
            callback_data: `attend:${trainingId}`
          },
          {
            text: '❌ Не буду',
            callback_data: `decline:${trainingId}`
          }
        ]
      ]
    }
  };

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
      console.log('✅ Уведомление отправлено с кнопками:', telegramId);
    }
  } catch (err) {
    console.error('❌ Ошибка отправки уведомления:', err.message);
  }
}
