import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.mjs';

const router = express.Router();
const prisma = new PrismaClient();

// 🔹 ✅ Получить активный блок текущего пользователя (по токену)
router.get('/user/me/active', authMiddleware, async (req, res) => {
  const userId = req.user?.userId;
  console.log('📥 [GET /user/me/active] req.user:', req.user);

  if (!userId) {
    console.warn('❌ userId отсутствует в токене!');
    return res.status(401).json({ error: 'Unauthorized: userId missing from token' });
  }

  try {
    const block = await prisma.paymentBlock.findFirst({
      where: { userId, active: true },
      orderBy: { paidAt: 'desc' },
    });

    if (!block) {
      console.warn(`📭 Активный блок не найден для userId: ${userId}`);
      return res.status(404).json({ error: 'No active block found' });
    }

    console.log('✅ Найден активный блок:', block);
    res.json(block);
  } catch (err) {
    console.error('❌ Ошибка GET /user/me/active:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 Получить активный блок по userId
router.get('/user/:userId/active', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  console.log('📥 [GET /user/:userId/active] userId:', userId);

  try {
    const block = await prisma.paymentBlock.findFirst({
      where: { userId, active: true },
      orderBy: { paidAt: 'desc' },
    });

    if (!block) {
      console.warn('📭 Нет активного блока для:', userId);
      return res.status(404).json({ error: 'No active block found' });
    }

    console.log('✅ Найден блок:', block);
    res.json(block);
  } catch (err) {
    console.error('❌ Ошибка GET /user/:userId/active:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 Получить все блоки по userId (история)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  console.log('📥 [GET /user/:userId] userId:', userId);

  try {
    const blocks = await prisma.paymentBlock.findMany({
      where: { userId },
      orderBy: { paidAt: 'desc' },
    });

    console.log(`📦 Найдено блоков: ${blocks.length}`);
    res.json(blocks);
  } catch (err) {
    console.error('❌ Ошибка GET /user/:userId:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 Получить активный блок по telegramId
router.get('/telegram/:telegramId/active', authMiddleware, async (req, res) => {
  const { telegramId } = req.params;
  console.log('📥 [GET /telegram/:telegramId/active] telegramId:', telegramId);

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      console.warn('❌ Пользователь не найден по telegramId');
      return res.status(404).json({ error: 'User not found' });
    }

    const block = await prisma.paymentBlock.findFirst({
      where: { userId: user.id, active: true },
      orderBy: { paidAt: 'desc' },
    });

    if (!block) {
      console.warn('📭 Нет активного блока для telegramId:', telegramId);
      return res.status(404).json({ error: 'No active block found' });
    }

    console.log('✅ Найден активный блок по Telegram:', block);
    res.json(block);
  } catch (err) {
    console.error('❌ Ошибка GET /telegram/:telegramId/active:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 Добавить новый блок оплаты
router.post('/', authMiddleware, async (req, res) => {
  const { userId, paidAt, paidTrainings, pricePerTraining, pricePerBlock } = req.body;
  console.log('📤 [POST /] Данные:', req.body);

  const finalPricePerBlock = pricePerBlock ?? (pricePerTraining * paidTrainings);

  try {
    const newBlock = await prisma.paymentBlock.create({
      data: {
        userId,
        paidAt: new Date(paidAt),
        paidTrainings: Number(paidTrainings),
        pricePerTraining: Number(pricePerTraining),
        pricePerBlock: Number(finalPricePerBlock),
        active: true,
      },
    });

    console.log('✅ Новый блок создан:', newBlock);

    const result = await prisma.paymentBlock.updateMany({
      where: {
        userId,
        id: { not: newBlock.id },
      },
      data: { active: false },
    });

    console.log(`🔄 Обновлено старых блоков: ${result.count}`);
    res.json(newBlock);
  } catch (err) {
    console.error('❌ Ошибка POST /:', err);
    res.status(500).json({ error: 'Ошибка при создании блока' });
  }
});

// 🔹 Обновить блок (used, active, данные)
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    paidAt,
    paidTrainings,
    pricePerTraining,
    pricePerBlock,
    used,
    active,
  } = req.body;

  console.log('✏️ Обновление блока:', id, req.body);

  try {
    const updated = await prisma.paymentBlock.update({
      where: { id },
      data: {
        paidAt: paidAt ? new Date(paidAt) : undefined,
        paidTrainings: paidTrainings !== undefined ? Number(paidTrainings) : undefined,
        pricePerTraining: pricePerTraining !== undefined ? Number(pricePerTraining) : undefined,
        pricePerBlock: pricePerBlock !== undefined
          ? Number(pricePerBlock)
          : (pricePerTraining && paidTrainings
            ? Number(pricePerTraining) * Number(paidTrainings)
            : undefined),
        used: typeof used === 'number' ? used : undefined,
        active: typeof active === 'boolean' ? active : undefined,
      },
    });

    console.log('✅ Блок обновлён:', updated);
    res.json(updated);
  } catch (err) {
    console.error('❌ Ошибка PATCH /:id:', err);
    res.status(500).json({ error: 'Ошибка при обновлении блока' });
  }
});

export default router;
