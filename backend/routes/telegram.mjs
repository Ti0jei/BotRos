import express from 'express';
import { bot } from '../bot/index.mjs';
import { prisma } from '../lib/prisma.mjs'; // или ../utils/db.mjs — смотри по проекту

const router = express.Router();

/**
 * POST /api/telegram/notify
 * Рассылка сообщений пользователям по роли
 */
router.post('/notify', async (req, res) => {
  const { message, role } = req.body;

  if (!message || !role) {
    return res.status(400).json({ error: 'Требуются message и role' });
  }

  try {
    const users = await getUsersFromDb(role);

    let success = 0;

    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.telegramId, `📰 ${message}`);
        success++;
      } catch (err) {
        console.error(`Не удалось отправить ${user.telegramId}:`, err.message);
      }
    }

    return res.json({ success, total: users.length });
  } catch (err) {
    console.error('Ошибка при рассылке:', err);
    return res.status(500).json({ error: 'Ошибка при рассылке' });
  }
});

export default router;

// ✅ Реальный запрос из БД
async function getUsersFromDb(role) {
  return await prisma.user.findMany({
    where: {
      role: role.toUpperCase(),
      telegramId: { not: null },
    },
    select: {
      telegramId: true,
    },
  });
}
