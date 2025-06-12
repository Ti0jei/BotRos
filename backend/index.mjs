// backend/index.mjs
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';

import authRoutes from './routes/auth.mjs';
import profileRoutes from './routes/profile.mjs';
import clientsRoutes from './routes/clients.mjs';
import trainingsRoutes from './routes/trainings.mjs';
import usersRoute from './routes/users.mjs';
import paymentBlocksRoutes from './routes/payment-blocks.mjs'; // ← добавлено

import { authMiddleware } from './middleware/auth.mjs';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Разрешаем все нужные фронтенды
app.use(cors({
  origin: [
    'https://bot-ros-frontend.vercel.app',
    'https://fittelega-frontend.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

// ✅ Обработка preflight-запросов
app.options('*', cors());
app.use(express.json());

// 🔧 Применяем миграции перед запуском
exec('npx prisma migrate deploy', (err, stdout, stderr) => {
  if (err) {
    console.error('❌ Prisma migration failed:', err);
  } else {
    console.log('✅ Prisma migration applied:');
    console.log(stdout);
  }

  // ✅ Подключение маршрутов
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', authMiddleware, profileRoutes);
  app.use('/api/clients', authMiddleware, clientsRoutes);
  app.use('/api/trainings', authMiddleware, trainingsRoutes);
  app.use('/api/users', usersRoute);
  app.use('/api/payment-blocks', authMiddleware, paymentBlocksRoutes); // ← добавлено

  // ✅ Старт сервера
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
});
