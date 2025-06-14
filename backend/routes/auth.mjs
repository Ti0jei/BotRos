import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Регистрация
router.post('/register', async (req, res) => {
  const { email, password, name, lastName, age, telegramId, inviteCode } = req.body;

  if (!email || !password || !name || !lastName || !age || !inviteCode) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Проверка инвайт-кода
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  if (telegramId) {
    const existingTg = await prisma.user.findFirst({
      where: { telegramId: String(telegramId) },
    });
    if (existingTg) {
      return res.status(400).json({ error: 'Telegram ID already linked to another user' });
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
    }
  });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user });
});

// Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'User not found' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user });
});

// ✅ Привязка Telegram ID (авторизованная, WebApp)
router.post('/telegram-connect', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { telegramId } = req.body;

  if (!telegramId || typeof telegramId !== 'number') {
    return res.status(400).json({ error: 'Invalid telegramId' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        telegramId: String(telegramId),
        NOT: { id: userId },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'This Telegram ID is already linked to another account' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { telegramId: String(telegramId) },
    });

    console.log(`✅ Telegram ID ${telegramId} сохранён для userId ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка при telegram-connect:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 📩 Telegram ID через бота
router.post('/telegram-direct', async (req, res) => {
  const { telegramId, username } = req.body;

  if (!telegramId) {
    return res.status(400).json({ error: 'Missing telegramId' });
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
      return res.status(404).json({ error: 'No available admin to link Telegram ID' });
    }

    await prisma.user.update({
      where: { id: admin.id },
      data: { telegramId: String(telegramId) },
    });

    console.log(`✅ Telegram ID ${telegramId} записан для администратора ${admin.email}`);
    res.json({ status: 'linked' });

  } catch (err) {
    console.error('❌ Ошибка при telegram-direct:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
