import { PrismaClient } from '@prisma/client';
import { notifyTelegramTraining } from '../../utils/notifyTelegramTraining.mjs';
import { shouldNotifyUser } from '../../lib/antiSpam.mjs';

const prisma = new PrismaClient();

export default async function createTraining(req, res) {
  const {
    userId,
    date,
    hour,
    isSinglePaid = false,
    singlePrice,
    singlePaymentMethod,
    templateId,
  } = req.body;

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can assign trainings' });
  }

  if (!userId || !date || hour === undefined) {
    return res.status(400).json({ error: 'Недостаточно данных' });
  }

  const parsedHour = parseInt(hour);
  if (isNaN(parsedHour)) {
    return res.status(400).json({ error: 'Неверный формат часа' });
  }

  const trainingDate = new Date(`${date}T00:00:00`);
  if (isNaN(trainingDate.getTime())) {
    return res.status(400).json({ error: 'Неверная дата' });
  }

  try {
    let assignedTemplateId = templateId || null;

    if (!assignedTemplateId) {
      const activeTemplates = await prisma.workoutTemplate.findMany({
        where: { userId, isActive: true },
        orderBy: { sequenceNumber: 'asc' },
      });

      if (activeTemplates.length > 0) {
        const pastTrainings = await prisma.training.findMany({
          where: { userId },
          orderBy: [{ date: 'desc' }, { hour: 'desc' }],
          take: 10,
        });

        const lastTemplateId = pastTrainings.find(t => t.templateId)?.templateId;
        if (!lastTemplateId) {
          assignedTemplateId = activeTemplates[0].id;
        } else {
          const lastIndex = activeTemplates.findIndex(t => t.id === lastTemplateId);
          assignedTemplateId = activeTemplates[(lastIndex + 1) % activeTemplates.length]?.id;
        }
      }
    }

    const training = await prisma.training.create({
      data: {
        userId,
        date: trainingDate,
        hour: parsedHour,
        isSinglePaid,
        singlePrice: isSinglePaid ? singlePrice : null,
        singlePaymentMethod: isSinglePaid ? singlePaymentMethod : null,
        templateId: assignedTemplateId,
      },
    });

    try {
      const now = new Date();
      const trainingDateTime = new Date(`${date}T${parsedHour.toString().padStart(2, '0')}:00:00`);
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (
        user?.telegramId &&
        trainingDateTime > now &&
        shouldNotifyUser(user.telegramId)
      ) {
        await notifyTelegramTraining(
          user.telegramId,
          training.id,
          date,
          parsedHour
        );
      }
    } catch (e) {
      console.warn('⚠️ Уведомление не отправлено:', e.message);
    }

    res.json({ success: true, training });
  } catch (err) {
    console.error('❌ Ошибка при создании тренировки:', err);
    res.status(500).json({ error: 'Не удалось создать тренировку' });
  }
}
