// backend/routes/telegram.mjs

import express from 'express';
import { bot } from '../bot/index.mjs';
import prisma from '../prisma/index.mjs'; // ✅ правильный путь к PrismaClient

const router = express.Router();

/**
 * POST /api/telegram/notify
 * Рассылка сообщений пользователям по роли
 */
router.post('/notify', async (req, res) => {
  const { message, role } = req.body;

  if (!message || !role) {
    console.warn('⚠️ Пустые параметры message или role');
    return res.status(400).json({ error: 'Требуются message и role' });
  }

  try {
    const users = await getUsersFromDb(role);
    console.log(`📋 Найдено ${users.length} пользователей с ролью ${role}`);

    let success = 0;

    for (const user of users) {
      console.log(`📤 Пытаюсь отправить сообщение пользователю ${user.telegramId}...`);
      try {
        await bot.telegram.sendMessage(user.telegramId, `📰 ${message}`);
        console.log(`✅ Успешно: ${user.telegramId}`);
        success++;
      } catch (err) {
        console.error(`❌ Не удалось отправить ${user.telegramId}:`, err.message);
      }
    }

    console.log(`📬 Рассылка завершена: ${success}/${users.length} успешно`);

    return res.json({ success, total: users.length });
  } catch (err) {
    console.error('❌ Ошибка при рассылке:', err);
    return res.status(500).json({ error: 'Ошибка при рассылке' });
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
      telegramId: {
        not: null,
      },
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
