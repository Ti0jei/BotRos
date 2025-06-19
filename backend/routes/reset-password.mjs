import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { resend } from '../utils/resend.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Шаг 1: Запрос на сброс пароля
router.post('/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  console.log('📩 Запрос сброса пароля для:', email);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('⛔ Email не найден в базе:', email);
      return res.status(200).json({ ok: true }); // не раскрываем наличие
    }

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
    console.log('🔗 Ссылка сброса:', resetUrl);

    const emailResult = await resend.emails.send({
      from: 'Fittelega <support@fittelega.com>',
      to: email,
      subject: 'Сброс пароля',
      html: `
        <p>Вы запросили сброс пароля в системе Fittelega.</p>
        <p><a href="${resetUrl}">Нажмите здесь, чтобы сбросить пароль</a></p>
        <p>Если вы не запрашивали, просто проигнорируйте это письмо.</p>
      `,
    });

    console.log('📨 Результат отправки:', emailResult);
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Ошибка при сбросе пароля:', err);
    res.status(500).json({ error: 'Ошибка при сбросе пароля' });
  }
});

// 🔹 Шаг 2: Подтверждение сброса (установка нового пароля)
router.post('/confirm', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Все поля обязательны' });

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      console.warn('⛔ Токен сброса недействителен или истёк:', token);
      return res.status(400).json({ error: 'Неверный или истёкший токен' });
    }

    const hashed = await Bun.password.hash(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    console.log('✅ Пароль обновлён для пользователя:', user.email);
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Ошибка при подтверждении сброса:', err);
    res.status(500).json({ error: 'Ошибка при установке пароля' });
  }
});

export default router;
