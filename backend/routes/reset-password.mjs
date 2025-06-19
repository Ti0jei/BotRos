import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { resend } from '../utils/resend.mjs'; // Убедись, что resend инициализирован

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Шаг 1: Запрос на сброс пароля (по email)
router.post('/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(200).json({ ok: true }); // не раскрываем наличие email

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 час

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpires: expires,
    },
  });

  const resetUrl = `https://fittelega-frontend.vercel.app/reset-password?token=${token}`;

  await resend.emails.send({
    from: 'Fittelega <support@fittelega.com>',
    to: email,
    subject: 'Сброс пароля',
    html: `
      <p>Вы запросили сброс пароля в системе Fittelega.</p>
      <p><a href="${resetUrl}">Нажмите здесь, чтобы сбросить пароль</a></p>
      <p>Если вы не запрашивали, проигнорируйте это письмо.</p>
    `,
  });

  res.json({ ok: true });
});

// 🔹 Шаг 2: Подтверждение сброса (установка нового пароля)
router.post('/confirm', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Все поля обязательны' });

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) return res.status(400).json({ error: 'Неверный или истёкший токен' });

  const hashed = await Bun.password.hash(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  res.json({ ok: true });
});

export default router;
