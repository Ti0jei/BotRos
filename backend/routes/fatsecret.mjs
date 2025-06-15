import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { authMiddleware } from '../middleware/auth.mjs';
import dayjs from 'dayjs';

dotenv.config();
const router = express.Router();
const prisma = new PrismaClient();

const {
  FATSECRET_CLIENT_ID,
  FATSECRET_CLIENT_SECRET,
  FATSECRET_REDIRECT_URI,
} = process.env;

const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const AUTHORIZE_URL = 'https://www.fatsecret.com/oauth/authorize';
const API_BASE = 'https://platform.fatsecret.com/rest/server.api';

// 🔹 1. ПУБЛИЧНЫЙ маршрут — авторизация без authMiddleware
router.get('/authorize', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).send('Missing userId');

    const url = `${AUTHORIZE_URL}?response_type=code&client_id=${FATSECRET_CLIENT_ID}&redirect_uri=${encodeURIComponent(FATSECRET_REDIRECT_URI)}&state=${userId}`;
    res.redirect(url);
  } catch (err) {
    console.error('Ошибка авторизации FatSecret:', err);
    res.status(500).send('Ошибка авторизации');
  }
});

// 🔹 2. Callback — сохраняем токен
router.get('/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code || !userId) return res.status(400).send('Недопустимые параметры');

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', FATSECRET_CLIENT_ID);
    params.append('client_secret', FATSECRET_CLIENT_SECRET);
    params.append('redirect_uri', FATSECRET_REDIRECT_URI);

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokenData = await response.json();
    if (!tokenData.access_token) {
      console.warn('Токен не получен:', tokenData);
      return res.status(400).json({ error: 'Не удалось получить токен', detail: tokenData });
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await prisma.fatSecretToken.upsert({
      where: { userId },
      update: { accessToken: access_token, refreshToken: refresh_token, expiresAt },
      create: { userId, accessToken: access_token, refreshToken: refresh_token, expiresAt },
    });

    res.send('✅ Аккаунт FatSecret подключён. Можете закрыть окно.');
  } catch (err) {
    console.error('FatSecret OAuth ошибка:', err);
    res.status(500).send('Ошибка авторизации FatSecret');
  }
});

// 🔹 3. Проверка подключения
router.get('/status', authMiddleware, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = await prisma.fatSecretToken.findUnique({ where: { userId } });
    const isConnected = !!token && !!token.accessToken && token.expiresAt > new Date();
    res.json({ connected: isConnected });
  } catch (err) {
    console.error('Ошибка при проверке FatSecret:', err);
    res.status(500).json({ connected: false, error: 'Ошибка сервера' });
  }
});

// 🔹 4. Получение дневных данных по питанию
router.get('/nutrition/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const token = await prisma.fatSecretToken.findUnique({ where: { userId } });
  if (!token || !token.accessToken) return res.status(404).json([]);

  const today = dayjs();
  const entries = [];

  for (let i = 0; i < 14; i++) {
    const date = today.subtract(i, 'day').format('YYYY-MM-DD');
    const response = await fetch(`${API_BASE}?method=entries.get&date=${date}&format=json`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });

    const json = await response.json();
    if (!json || !json.entries) continue;

    const { calories = 0, carbohydrate = 0, protein = 0, fat = 0 } = json.entries;
    entries.push({
      date,
      calories: +calories,
      carbs: +carbohydrate,
      protein: +protein,
      fat: +fat,
    });
  }

  res.json(entries.reverse());
});

// 🔹 5. Суммарные данные (неделя или месяц)
router.get('/summary/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  const { period = 'week' } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const token = await prisma.fatSecretToken.findUnique({ where: { userId } });
  if (!token || !token.accessToken) return res.status(404).json({});

  const days = period === 'month' ? 30 : 7;
  const today = dayjs();

  let total = { calories: 0, protein: 0, fat: 0, carbs: 0 };

  for (let i = 0; i < days; i++) {
    const date = today.subtract(i, 'day').format('YYYY-MM-DD');
    const response = await fetch(`${API_BASE}?method=entries.get&date=${date}&format=json`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });

    const json = await response.json();
    if (!json || !json.entries) continue;

    const { calories = 0, carbohydrate = 0, protein = 0, fat = 0 } = json.entries;

    total.calories += +calories;
    total.carbs += +carbohydrate;
    total.protein += +protein;
    total.fat += +fat;
  }

  res.json({ period, ...total });
});

// 🔹 6. Сброс подключения
router.delete('/token/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    await prisma.fatSecretToken.delete({ where: { userId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении токена:', err);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

export default router;
