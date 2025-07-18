import fetch from 'node-fetch';
import { API_URL } from '../bot/index.mjs';

/**
 * Отправка рассылки по роли
 * @param {string} text — текст сообщения
 * @param {'USER'|'ADMIN'} role — целевая аудитория
 * @returns {{ success: number, total: number }}
 */
export async function notifyBroadcast(text, role = 'USER') {
  try {
    const res = await fetch(`${API_URL}/api/telegram/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text, role }),
    });

    if (!res.ok) {
      throw new Error(`Ответ сервера: ${res.status}`);
    }

    const result = await res.json(); // { success, total }
    return result;
  } catch (err) {
    console.error('❌ Ошибка при notifyBroadcast:', err);
    throw err;
  }
}
