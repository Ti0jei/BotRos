import express from 'express';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const router = express.Router();
const prisma = new PrismaClient();

// 🔐 Шаблон: XXtXtXXXT
function generateInviteCode() {
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const digits = '0123456789'.split('');
  const lowers = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    rand(digits) +
    rand(digits) +
    rand(lowers) +
    rand(digits) +
    rand(lowers) +
    rand(digits) +
    rand(digits) +
    rand(digits) +
    rand(uppers)
  );
}

// 🔄 GET /api/invite-code?admin=true&force=true
router.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true'; // 🔐 можно заменить на авторизацию
    const forceNew = req.query.force === 'true';
    if (!isAdmin) return res.status(403).json({ error: 'Доступ запрещён' });

    const now = new Date();

    let activeCode = null;

    if (forceNew) {
      // Удалить все старые
      await prisma.inviteCode.deleteMany({});
      // Создать новый
      activeCode = await prisma.inviteCode.create({
        data: {
          code: generateInviteCode(),
          expiresAt: dayjs(now).add(1, 'hour').toDate()
        }
      });
    } else {
      // Найти активный
      activeCode = await prisma.inviteCode.findFirst({
        where: {
          expiresAt: { gt: now }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!activeCode) {
        // Если нет активного — создать новый
        await prisma.inviteCode.deleteMany({});
        activeCode = await prisma.inviteCode.create({
          data: {
            code: generateInviteCode(),
            expiresAt: dayjs(now).add(1, 'hour').toDate()
          }
        });
      }
    }

    return res.json({
      code: activeCode.code,
      expiresAt: activeCode.expiresAt
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
