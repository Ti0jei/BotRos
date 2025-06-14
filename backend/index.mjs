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
import inviteCodeRoutes from './routes/invite-code.mjs'; // ✅ добавлено

import { authMiddleware } from './middleware/auth.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Безопасный CORS: разрешаем запросы с фронтенда на Vercel
app.use(cors({
  origin: 'https://bot-ros-frontend.vercel.app',
  credentials: true,
}));

app.options('*', cors());
app.use(express.json());

// ✅ Роуты
app.use('/api/auth', authRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/clients', authMiddleware, clientsRoutes);
app.use('/api/trainings', authMiddleware, trainingsRoutes);
app.use('/api/users', usersRoute);
app.use('/api/payment-blocks', authMiddleware, paymentBlocksRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invite-code', inviteCodeRoutes); // ✅ подключено

// ✅ Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
