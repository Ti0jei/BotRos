import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { authMiddleware } from '../middleware/auth.mjs';

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

// 🔹 1. Авторизация — редирект на FatSecret
router.get('/authorize', authMiddleware, async (req, res) => {
  try {
    const state = req.user.id;
    const url = `${AUTHORIZE_URL}?response_type=code&client_id=${FATSECRET_CLIENT_ID}&redirect_uri=${encodeURIComponent(FATSECRET_REDIRECT_URI)}&state=${state}`;
    res.redirect(url);
  } catch (err) {
    console.error('Ошибка авторизации FatSecret:', err);
    res.status(500).send('Ошибка авторизации');
  }
});

// 🔹 2. Callback — сохраняем access/refresh токен
router.get('/callback', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).send('Недопустимые параметры в callback');
  }

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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = await response.json();

    if (!tokenData.access_token) {
      console.warn('Не удалось получить токен:', tokenData);
      return res.status(400).json({ error: 'Не удалось получить токен', detail: tokenData });
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await prisma.fatSecretToken.upsert({
      where: { userId },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
      create: {
        userId,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      },
    });

    res.send('✅ Аккаунт FatSecret успешно подключён. Можете закрыть окно.');
  } catch (err) {
    console.error('FatSecret OAuth ошибка:', err);
    res.status(500).send('Ошибка при авторизации FatSecret');
  }
});

// 🔹 3. Проверка подключения
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const token = await prisma.fatSecretToken.findUnique({
      where: { userId: req.user.id },
    });

    const isConnected = !!token && !!token.accessToken && token.expiresAt > new Date();
    res.json({ connected: isConnected });
  } catch (err) {
    console.error('Ошибка при проверке FatSecret:', err);
    res.status(500).json({ connected: false, error: 'Ошибка сервера' });
  }
});

export default router;
