// backend/routes/auth.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.mjs';
import { resend } from '../utils/resend.mjs';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const EMAIL_FROM = process.env.EMAIL_FROM || 'support@krissfit.ru';

// 🚀 Регистрация
router.post('/register', async (req, res) => {
  const { email, password, name, lastName, age, telegramId, inviteCode } = req.body;

  if (!email || !password || !name || !lastName || !age || !inviteCode) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  const now = new Date();
  const validCode = await prisma.inviteCode.findFirst({
    where: { code: inviteCode, expiresAt: { gt: now } },
  });

  if (!validCode) {
    return res.status(400).json({ error: 'Неверный или просроченный инвайт-код' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Пользователь уже существует' });

  if (telegramId) {
    const existingTg = await prisma.user.findFirst({
      where: { telegramId: BigInt(telegramId).toString() },
    });
    if (existingTg) return res.status(400).json({ error: 'Этот Telegram уже привязан' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const emailToken = crypto.randomBytes(32).toString('hex');
  const emailTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      lastName,
      age: parseInt(age),
      role: 'USER',
      telegramId: telegramId ? BigInt(telegramId).toString() : null,
      internalTag: null,
      emailToken,
      emailTokenExpires,
    },
  });

  await prisma.inviteCode.delete({ where: { id: validCode.id } });

  const verifyUrl = `https://ti0jei-botros-7a22.twc1.net/api/auth/verify?token=${emailToken}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Подтвердите вашу почту',
    html: `
      <p>Здравствуйте, ${name}!</p>
      <p>Перейдите по ссылке для подтверждения email:</p>
      <p><a href="${verifyUrl}">Подтвердить почту</a></p>
      <p>Если кнопка не работает — скопируйте ссылку в браузер:</p>
      <p>${verifyUrl}</p>
    `,
  });

  res.json({ message: 'Письмо с подтверждением отправлено. Подтвердите email для входа.' });
});

// 🔐 Подтверждение email
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return res.status(400).send('Некорректный токен');
  }

  const user = await prisma.user.findFirst({
    where: {
      emailToken: token,
      emailTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).send('Токен недействителен или истёк');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailToken: null,
      emailTokenExpires: null,
    },
  });

  res.redirect(`https://ti0jei-botros-040b.twc1.net/login?verified=true`);
});

// 🔑 Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Пользователь не найден' });

  if (!user.emailVerified) {
    return res.status(400).json({ error: 'Подтвердите email перед входом' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Неверный пароль' });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      role: user.role,
    },
  });
});

// 📬 Повторная отправка письма
router.post('/resend', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Пользователь не найден' });
  if (user.emailVerified) return res.status(400).json({ error: 'Email уже подтверждён' });

  const emailToken = crypto.randomBytes(32).toString('hex');
  const emailTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailToken, emailTokenExpires },
  });

  const verifyUrl = `https://ti0jei-botros-7a22.twc1.net/api/auth/verify?token=${emailToken}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Подтвердите вашу почту (повторно)',
    html: `
      <p>Здравствуйте, ${user.name}!</p>
      <p><a href="${verifyUrl}">Подтвердить почту</a></p>
      <p>${verifyUrl}</p>
    `,
  });

  res.json({ message: 'Письмо отправлено повторно' });
});

// 📲 Привязка Telegram ID (из WebApp)
router.post('/telegram-connect', authMiddleware, async (req, res) => {
  const userId = req.user?.userId;
  const { telegramId } = req.body;

  if (!userId || !telegramId) {
    return res.status(400).json({ error: 'Некорректные параметры' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { telegramId: BigInt(telegramId).toString(), NOT: { id: userId } },
    });

    if (existing) {
      return res.status(400).json({ error: 'Этот Telegram уже привязан' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { telegramId: BigInt(telegramId).toString() },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка при telegram-connect:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 🤖 Прямая привязка Telegram ID из бота
router.post('/telegram-direct', async (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'Не указан telegramId' });

  try {
    const existing = await prisma.user.findFirst({
      where: { telegramId: BigInt(telegramId).toString() },
    });
    if (existing) return res.json({ status: 'already linked' });

    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN', telegramId: null },
    });

    if (!admin) return res.status(404).json({ error: 'Нет свободного администратора' });

    await prisma.user.update({
      where: { id: admin.id },
      data: { telegramId: BigInt(telegramId).toString() },
    });

    res.json({ status: 'linked' });
  } catch (err) {
    console.error('❌ Ошибка при telegram-direct:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ Проверка Telegram ID
router.get('/check-telegram', async (req, res) => {
  const { telegramId } = req.query;

  if (!telegramId) {
    return res.status(400).json({ error: 'telegramId обязателен' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { telegramId: BigInt(telegramId).toString() },
    });

    res.json({ exists: !!user });
  } catch (err) {
    console.error('❌ Ошибка при check-telegram:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
