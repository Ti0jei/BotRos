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

// 🔄 GET /api/invite-code — только для админа
router.get('/', async (req, res) => {
  try {
    // Временно: простой админ-доступ по query или можно authMiddleware.role === ADMIN
    const isAdmin = req.query.admin === 'true'; // заменить на авторизацию!
    if (!isAdmin) return res.status(403).json({ error: 'Доступ запрещён' });

    const now = new Date();

    let active = await prisma.inviteCode.findFirst({
      where: {
        expiresAt: { gt: now }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!active) {
      const code = generateInviteCode();
      active = await prisma.inviteCode.create({
        data: {
          code,
          expiresAt: dayjs(now).add(1, 'hour').toDate()
        }
      });
    }

    return res.json({ code: active.code, expiresAt: active.expiresAt });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
