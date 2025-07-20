import fetch from 'node-fetch';

const API_URL = process.env.API_BASE_URL;

/**
 * Отправка рассылки по роли
 * @param {string} text — текст сообщения
 * @param {'USER'|'ADMIN'} role — целевая аудитория
 * @returns {{ success: number, total: number }}
 */
export async function notifyBroadcast(text, role = 'USER') {
  if (!API_URL) throw new Error('❌ API_BASE_URL не определён в окружении');

  const url = `${API_URL.replace(/\/$/, '')}/api/telegram/notify`;

  console.log(`📡 notifyBroadcast → ${url}`);
  console.log('📨 Payload:', { message: text, role });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, role }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Ошибка API ${res.status}: ${errText}`);
      throw new Error(errText);
    }

    const result = await res.json();
    console.log('✅ notifyBroadcast ответ:', result);
    return result;
  } catch (err) {
    console.error('❌ notifyBroadcast FAILED:', err.message);
    throw err;
  }
}
