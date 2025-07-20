import fetch from 'node-fetch';

const API_URL = process.env.API_BASE_URL;

/**
 * Отправка рассылки по роли
 * @param {string} text — текст сообщения
 * @param {'USER'|'ADMIN'} role — целевая аудитория
 * @returns {{ success: number, total: number }}
 */
export async function notifyBroadcast(text, role = 'USER') {
  const cleanText = (text || '').trim();
  const roleNormalized = (role || '').toUpperCase();

  if (!API_URL) throw new Error('❌ API_BASE_URL не определён в окружении');
  if (!cleanText || cleanText.length < 5) throw new Error('❌ Текст сообщения слишком короткий');
  if (!['USER', 'ADMIN'].includes(roleNormalized)) throw new Error('❌ Недопустимая роль');

  const url = `${API_URL.replace(/\/$/, '')}/api/telegram/notify`;
  const payload = { message: cleanText, role: roleNormalized };

  const startedAt = Date.now();
  console.log(`📡 [notifyBroadcast] → ${url}`);
  console.log('📨 Payload:', payload);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - startedAt;

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ API ${res.status} (${elapsed}ms): ${errText}`);
      throw new Error(`Ошибка API ${res.status}: ${errText}`);
    }

    const result = await res.json();
    console.log(`✅ Ответ (${elapsed}ms):`, result);

    if (typeof result.success !== 'number' || typeof result.total !== 'number') {
      throw new Error('❌ Некорректный формат ответа от API');
    }

    return result;
  } catch (err) {
    console.error('❌ notifyBroadcast FAILED:', err.message);
    throw err;
  }
}
