import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

/**
 * Универсальная функция рассылки
 * @param {Object} options
 * @param {string[]} [options.roles] - ['ADMIN', 'USER']
 * @param {string[]} [options.telegramIds] - массив id пользователей Telegram
 * @param {string} options.message - текст рассылки
 */
export async function notifyUsers({ roles = [], telegramIds = [], message }) {
  if (!TOKEN || !message) {
    console.warn('❌ notifyUsers: Отсутствует токен или сообщение');
    return;
  }

  let targets = [];

  if (telegramIds.length) {
    targets = telegramIds;
  } else if (roles.length) {
    const users = await prisma.user.findMany({
      where: { role: { in: roles }, telegramId: { not: null } },
      select: { telegramId: true },
    });
    targets = users.map((u) => u.telegramId);
  }

  for (const id of targets) {
    try {
      await fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: id, text: message }),
      });
      console.log(`✅ Уведомление отправлено: ${id}`);
    } catch (e) {
      console.warn(`❌ Ошибка отправки для ${id}:`, e.message);
    }
  }
}
