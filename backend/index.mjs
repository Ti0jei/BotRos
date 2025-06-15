import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.mjs';
import profileRoutes from './routes/profile.mjs';
import clientsRoutes from './routes/clients.mjs';
import trainingsRoutes from './routes/trainings.mjs';
import usersRoute from './routes/users.mjs';
import paymentBlocksRoutes from './routes/payment-blocks.mjs';
import notificationRoutes from './routes/notifications.mjs';
import inviteCodeRoutes from './routes/invite-code.mjs';
import fatSecretRoutes from './routes/fatsecret.mjs'; // ✅ FatSecret маршруты

import { authMiddleware } from './middleware/auth.mjs';
import { resend } from './utils/resend.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS: разрешаем доступ только с твоего фронтенда
app.use(cors({
  origin: 'https://bot-ros-frontend.vercel.app',
  credentials: true,
}));
app.options('*', cors());

app.use(express.json());

// ✅ Основные роуты
app.use('/api/auth', authRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/clients', authMiddleware, clientsRoutes);
app.use('/api/trainings', authMiddleware, trainingsRoutes);
app.use('/api/users', usersRoute);
app.use('/api/payment-blocks', authMiddleware, paymentBlocksRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invite-code', inviteCodeRoutes);
app.use('/api/fatsecret', authMiddleware, fatSecretRoutes); // ✅ OAuth FatSecret требует авторизации

// ✅ Тест email-уведомления через Resend
app.get('/api/test-email', async (req, res) => {
  try {
    const to = 'zoty2104@gmail.com'; // Замени на нужный email
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

// ✅ Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
