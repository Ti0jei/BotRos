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
        <div style="font-family: Inter, sans-serif; background-color: #f7f7f7; padding: 40px;">
          <div style="max-width: 420px; margin: auto; background-color: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h2 style="margin-bottom: 16px; color: #1a1a1a; font-size: 20px;">Сброс пароля</h2>
            <p style="font-size: 15px; color: #1a1a1a;">Вы запросили сброс пароля в Krissfit.</p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" 
                style="display: inline-block; background-color: #f06595; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">
                Сбросить пароль
              </a>
            </div>

            <p style="font-size: 14px; color: #777;">
              Если это были не вы — просто проигнорируйте это письмо.
            </p>
          </div>

          <p style="text-align: center; margin-top: 24px; font-size: 13px; color: #aaa;">
            @Krissfit_bot
          </p>
        </div>
      `,
      text: `Вы запросили сброс пароля в Krissfit.\nСбросьте пароль по ссылке:\n${resetUrl}\n\nЕсли вы не запрашивали — просто проигнорируйте это письмо.`,
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
