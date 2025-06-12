import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Временное создание тренера
(async () => {
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@fit.com' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: 'admin@fit.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Главный тренер',
        age: 30,
        role: 'ADMIN',
      }
    });
    console.log('✅ Админ создан: admin@fit.com / admin123');
  }
})();

// Регистрация
router.post('/register', async (req, res) => {
  const { email, password, name, age } = req.body;
  if (!email || !password || !name || !age) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      age: parseInt(age),
      role: 'USER'
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

// ✅ Подключение Telegram ID
router.post('/telegram-connect', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { telegramId } = req.body;

  if (!telegramId || typeof telegramId !== 'number') {
    console.warn('⚠️ Неверный telegramId:', telegramId);
    return res.status(400).json({ error: 'Invalid telegramId' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.telegramId && user.telegramId === String(telegramId)) {
      console.log('ℹ️ Telegram ID уже привязан');
      return res.json({ success: true });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { telegramId: String(telegramId) },
    });

    console.log(`✅ Telegram ID ${telegramId} сохранён для userId ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка при сохранении telegramId:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
