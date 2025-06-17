import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

import authRoutes from './routes/auth.mjs';
import profileRoutes from './routes/profile.mjs';
import clientsRoutes from './routes/clients.mjs';
import trainingsRoutes from './routes/trainings.mjs';
import usersRoute from './routes/users.mjs';
import paymentBlocksRoutes from './routes/payment-blocks.mjs';
import notificationRoutes from './routes/notifications.mjs';
import inviteCodeRoutes from './routes/invite-code.mjs';
import nutritionRoutes from './routes/nutrition.mjs'; // ✅ ручное питание

import { authMiddleware } from './middleware/auth.mjs';
import { resend } from './utils/resend.mjs';
import './cron/nutritionReminder.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://bot-ros-frontend.vercel.app',
  credentials: true,
}));
app.options('*', cors());

app.use(express.json());

// ✅ Основные API роуты
app.use('/api/auth', authRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/clients', authMiddleware, clientsRoutes);
app.use('/api/trainings', authMiddleware, trainingsRoutes);
app.use('/api/users', usersRoute);
app.use('/api/payment-blocks', authMiddleware, paymentBlocksRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invite-code', inviteCodeRoutes);
app.use('/api/nutrition', authMiddleware, nutritionRoutes);

// 🌐 Узнать IP сервера
app.get('/ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.send(`🌐 Внешний IP сервера: ${data.ip}`);
  } catch (err) {
    res.status(500).send('Не удалось получить IP');
  }
});

// 📤 Проверка email-отправки
app.get('/api/test-email', async (req, res) => {
  try {
    const to = 'zoty2104@gmail.com';
    const from = process.env.EMAIL_FROM;

    const result = await resend.emails.send({
      from,
      to,
      subject: '✅ Проверка Resend',
      html: `<p>Если ты читаешь это — Resend работает!</p>`,
    });

    console.log('📤 Email отправлен:', result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('❌ Ошибка при отправке email:', err);
    res.status(500).json({ error: 'Ошибка при отправке письма', details: err });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
