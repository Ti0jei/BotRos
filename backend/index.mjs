import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.mjs';
import profileRoutes from './routes/profile.mjs';
import clientsRoutes from './routes/clients.mjs';
import trainingsRoutes from './routes/trainings.mjs';
import usersRoute from './routes/users.mjs';
import paymentBlocksRoutes from './routes/payment-blocks.mjs';
import notificationRoutes from './routes/notifications.mjs';
import inviteCodeRoutes from './routes/invite-code.mjs';
import nutritionRoutes from './routes/nutrition.mjs';
import resetPasswordRoutes from './routes/reset-password.mjs';

import { authMiddleware } from './middleware/auth.mjs';
import { resend } from './utils/resend.mjs';
import './cron/nutritionReminder.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

process.on('uncaughtException', (err) => {
  console.error('❗ Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('❗ Unhandled Rejection:', err);
});

console.log('🧪 Запуск сервера... NODE_ENV =', NODE_ENV);
console.log('🧪 Запуск на порту:', PORT);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.WEB_APP_URL || '*',
  credentials: true,
}));
app.options('*', cors());
app.use(express.json());

// Health-check
app.get('/health', (req, res) => {
  res.status(200).json({ status: '🟢 API работает', timestamp: new Date().toISOString() });
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/clients', authMiddleware, clientsRoutes);
app.use('/api/trainings', authMiddleware, trainingsRoutes);
app.use('/api/users', usersRoute);
app.use('/api/payment-blocks', paymentBlocksRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/invite-code', inviteCodeRoutes);
app.use('/api/nutrition', authMiddleware, nutritionRoutes);
app.use('/api/reset-password', resetPasswordRoutes);

// IP
app.get('/ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.send(`🌐 Внешний IP сервера: ${data.ip}`);
  } catch (err) {
    console.error('❌ IP fetch error:', err.message);
    res.status(500).send('Не удалось получить IP');
  }
});

// Email test
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

// Статический фронт
if (NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});

// Безопасный запуск Telegram-бота
(async () => {
  const botPath = path.join(__dirname, '../bot.js');
  if (fs.existsSync(botPath)) {
    try {
      await import('../bot.js');
      console.log('🤖 Telegram-бот успешно запущен');
    } catch (err) {
      console.error('❌ Ошибка при запуске Telegram-бота:', err.message);
    }
  } else {
    console.log('⚠️ Файл bot.js не найден — бот не запущен');
  }
})();
