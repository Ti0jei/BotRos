import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { PrismaClient } from '@prisma/client';
import { notifyTelegram } from '../../bot/notifications.mjs';
import { shouldNotifyUser } from '../../lib/antiSpam.mjs';

dayjs.extend(utc);
dayjs.extend(timezone);

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

  // ✅ Используем dayjs — безопасное создание даты
  const trainingDate = dayjs(date, 'YYYY-MM-DD');
  if (!trainingDate.isValid()) {
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
        date: trainingDate.toDate(), // 👈 сохраняем нормализованную дату
        hour: parsedHour,
        isSinglePaid,
        singlePrice: isSinglePaid ? singlePrice : null,
        singlePaymentMethod: isSinglePaid ? singlePaymentMethod : null,
        templateId: assignedTemplateId,
      },
    });

    // Уведомление
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      const trainingDateTime = trainingDate.hour(parsedHour).minute(0).second(0);

      if (
        user?.telegramId &&
        trainingDateTime.isAfter(dayjs()) &&
        shouldNotifyUser(user.telegramId)
      ) {
        await notifyTelegram(
          user.telegramId,
          `📅 Вам назначена тренировка на ${trainingDate.format('DD.MM.YYYY')} в ${parsedHour}:00\nПодтвердите участие:`,
          training.id
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
