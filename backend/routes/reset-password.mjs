import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { resend } from '../utils/resend.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 Шаг 1: Запрос на сброс пароля
router.post('/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  console.log('📩 [reset-request] Запрос на email:', email);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('⛔ Email не найден:', email);
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

    const resetUrl = `https://ti0jei-botros-040b.twc1.net/reset-password?token=${token}`;
    console.log('🔗 Ссылка на сброс:', resetUrl);

    const result = await resend.emails.send({
      from: 'Krissfit Support <support@krissfit.ru>',
      to: email,
      subject: '🔐 Восстановление доступа к Krissfit',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; background-color: #ffffff; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);">
          <h2 style="margin-bottom: 16px; color: #222;">Сброс пароля</h2>
          <p style="font-size: 16px; color: #333;">
            Вы запросили сброс пароля на Krissfit.
          </p>
          <p>
            <a href="${resetUrl}"
              style="display: inline-block; margin-top: 16px; background-color: #f06595; color: white; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none;">
              Сбросить пароль
            </a>
          </p>
          <p style="margin-top: 24px; font-size: 14px; color: #777;">
            Если вы не запрашивали сброс — просто проигнорируйте это письмо.
          </p>
        </div>
      `,
      text: `Вы запросили сброс пароля в Krissfit. Перейдите по ссылке:\n${resetUrl}\n\nЕсли вы не запрашивали — просто проигнорируйте это письмо.`,
      reply_to: 'support@krissfit.ru',
    });

    console.log('📨 [Resend] результат:', result);
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Ошибка при сбросе:', err);
    res.status(500).json({ error: 'Ошибка при сбросе пароля' });
  }
});

// 🔹 Шаг 2: Подтверждение сброса
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
      console.warn('⛔ Токен недействителен или истёк:', token);
      return res.status(400).json({ error: 'Неверный или истёкший токен' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    console.log('✅ Пароль обновлён для:', user.email);
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Ошибка при сбросе:', err);
    res.status(500).json({ error: 'Ошибка при сбросе пароля' });
  }
});

export default router;
