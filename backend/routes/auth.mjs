import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// 🚀 Регистрация
router.post('/register', async (req, res) => {
  const { email, password, name, lastName, age, telegramId, inviteCode } = req.body;

  if (!email || !password || !name || !lastName || !age || !inviteCode) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  // 🔐 Проверка инвайт-кода
  const now = new Date();
  const validCode = await prisma.inviteCode.findFirst({
    where: {
      code: inviteCode,
      expiresAt: { gt: now },
    },
  });

  if (!validCode) {
    return res.status(400).json({ error: 'Неверный или просроченный инвайт-код' });
  }

  // 🔄 Проверка email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }

  // 🔄 Проверка telegramId
  if (telegramId) {
    const existingTg = await prisma.user.findFirst({
      where: { telegramId: String(telegramId) },
    });
    if (existingTg) {
      return res.status(400).json({ error: 'Этот Telegram уже привязан' });
    }
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      lastName,
      age: parseInt(age),
      role: 'USER',
      telegramId: telegramId ? String(telegramId) : null,
      internalTag: null,
    },
  });

  // ✅ Опционально: удаляем использованный код
  await prisma.inviteCode.deleteMany({ where: { id: validCode.id } });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user });
});

// 🔑 Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Пользователь не найден' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Неверный пароль' });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user });
});

// 📲 Привязка Telegram ID из WebApp
router.post('/telegram-connect', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { telegramId } = req.body;

  if (!telegramId || typeof telegramId !== 'number') {
    return res.status(400).json({ error: 'Некорректный telegramId' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        telegramId: String(telegramId),
        NOT: { id: userId },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Этот Telegram уже привязан к другому аккаунту' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { telegramId: String(telegramId) },
    });

    console.log(`✅ Telegram ID ${telegramId} сохранён для userId ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка при telegram-connect:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 🤖 Telegram ID напрямую через бота
router.post('/telegram-direct', async (req, res) => {
  const { telegramId, username } = req.body;

  if (!telegramId) {
    return res.status(400).json({ error: 'Не указан telegramId' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { telegramId: String(telegramId) },
    });

    if (existing) {
      console.log(`ℹ️ Telegram ID ${telegramId} уже привязан`);
      return res.json({ status: 'already linked' });
    }

    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN', telegramId: null },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Нет свободного администратора' });
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { telegramId: String(telegramId) },
    });

    console.log(`✅ Telegram ID ${telegramId} записан для администратора ${admin.email}`);
    res.json({ status: 'linked' });

  } catch (err) {
    console.error('❌ Ошибка при telegram-direct:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
