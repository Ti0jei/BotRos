import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth.mjs';
import { notifyTelegram } from '../../utils/telegram.mjs';
import { shouldNotifyTrainer } from '../../lib/antiSpam.mjs';

const router = express.Router();
const prisma = new PrismaClient();

router.patch('/:id/attended', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { attended } = req.body;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can mark attendance' });
  }

  const training = await prisma.training.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!training) {
    return res.status(404).json({ error: 'Training not found' });
  }

  if (training.attended === attended) {
    return res.status(200).json(training);
  }

  if (training.isSinglePaid) {
    const updated = await prisma.training.update({
      where: { id },
      data: { attended },
    });
    return res.json(updated);
  }

  const dateOnly = (d) => d.toISOString().slice(0, 10);
  const trainingDate = new Date(training.date);
  const activeBlock = await prisma.paymentBlock.findFirst({
    where: { userId: training.userId, active: true },
  });

  if (!activeBlock || dateOnly(trainingDate) < dateOnly(activeBlock.paidAt)) {
    return res.status(400).json({ error: 'Нет подходящего активного блока для списания' });
  }

  const nextUsed = (activeBlock.used || 0) + 1;

  const updated = await prisma.training.update({
    where: { id },
    data: {
      attended,
      wasCounted: true,
      blockId: activeBlock.id,
    },
  });

  await prisma.paymentBlock.update({
    where: { id: activeBlock.id },
    data: { used: nextUsed },
  });

  if (nextUsed >= activeBlock.paidTrainings) {
    await prisma.paymentBlock.update({
      where: { id: activeBlock.id },
      data: { active: false },
    });

    const trainer = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    if (trainer?.telegramId && shouldNotifyTrainer(trainer.telegramId)) {
      await notifyTelegram(
        trainer.telegramId,
        `❗ У клиента ${training.user.name} закончился блок (${nextUsed} из ${activeBlock.paidTrainings}). Напомните ему об оплате.`
      );
    }
  }

  res.json(updated);
});

export default router;
