import fetch from 'node-fetch';

const API_URL = process.env.API_BASE_URL;

/**
 * Отправка рассылки по роли
 * @param {string} text — текст сообщения
 * @param {'USER'|'ADMIN'} role — целевая аудитория
 * @returns {{ success: number, total: number }}
 */
export async function notifyBroadcast(text, role = 'USER') {
  try {
    if (!API_URL) {
      throw new Error('❌ API_BASE_URL не определён');
    }

    console.log(`📡 notifyBroadcast → ${API_URL}/api/telegram/notify`);

    const res = await fetch(`${API_URL}/api/telegram/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text, role }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`❌ Ошибка сервера ${res.status}: ${errText}`);
    }

    const result = await res.json();
    return result;
  } catch (err) {
    console.error('❌ notifyBroadcast FAILED:', err);
    throw err;
  }
}
