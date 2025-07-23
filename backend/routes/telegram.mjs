import express from 'express';
import { bot } from '../bot/index.mjs';
import prisma from '../prisma/index.mjs';

const router = express.Router();

/**
 * GET /api/telegram/notify
 * Просто проверка доступности ручки (не для рассылки)
 */
router.get('/notify', (req, res) => {
  res.status(200).send('🟢 Telegram notify endpoint работает (используй POST)');
});

/**
 * POST /api/telegram/notify
 * Рассылка сообщений пользователям по роли
 */
router.post('/notify', async (req, res) => {
  const { message, role } = req.body;

  if (typeof message !== 'string' || message.trim().length < 5) {
    return res.status(400).json({ error: '❌ Укажите корректный message (минимум 5 символов)' });
  }

  if (!['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: '❌ Недопустимая роль. Используйте USER или ADMIN' });
  }

  try {
    const users = await getUsersFromDb(role);
    console.log(`📋 Найдено ${users.length} пользователей с ролью ${role}`);

    let success = 0;
    const errors = [];

    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.telegramId, `📰 ${message}`);
        console.log(`✅ Успешно отправлено: ${user.telegramId}`);
        success++;
      } catch (err) {
        console.error(`❌ Не удалось отправить ${user.telegramId}:`, err.message);
        errors.push({ telegramId: user.telegramId, error: err.message });
      }
    }

    console.log(`📬 Рассылка завершена: ${success}/${users.length} успешно`);

    return res.json({
      success,
      total: users.length,
      errors,
    });
  } catch (err) {
    console.error('❌ Ошибка при рассылке:', err);
    return res.status(500).json({ error: 'Ошибка при выполнении рассылки' });
  }
});

export default router;

/**
 * Получение пользователей по роли из БД
 * @param {string} role 'USER' или 'ADMIN'
 */
async function getUsersFromDb(role) {
  console.log(`🔍 Поиск пользователей с ролью: ${role}`);

  const result = await prisma.user.findMany({
    where: {
      role: role.toUpperCase(),
      telegramId: { not: null },
      active: true, // если в твоей таблице есть такое поле
    },
    select: {
      telegramId: true,
    },
  });

  if (!result.length) {
    console.warn(`⚠️ Пользователи с ролью ${role} и telegramId не найдены`);
  }

  return result;
}
