import { PrismaClient } from '@prisma/client';
import { notifyTelegram } from '../../utils/telegram.mjs';

const prisma = new PrismaClient();

export default async function deleteTraining(req, res) {
  const { id } = req.params;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can delete trainings' });
  }

  const training = await prisma.training.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!training) {
    return res.status(404).json({ error: 'Training not found' });
  }

  if (training.wasCounted) {
    return res.status(400).json({ error: 'Нельзя удалить посещённую тренировку' });
  }

  await prisma.training.delete({ where: { id } });

  const today = new Date();
  const trainingDate = new Date(training.date);

  if (training.user?.telegramId && trainingDate >= new Date(today.toDateString())) {
    await notifyTelegram(
      training.user.telegramId,
      `❌ Ваша тренировка на ${trainingDate.toLocaleDateString()} в ${training.hour}:00 была отменена`,
      null // 🔧 чтобы не показывались кнопки
    );
  }

  res.json({ success: true });
}
