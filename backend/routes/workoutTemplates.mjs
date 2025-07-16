import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// 🔹 GET /api/workout-templates?clientId=...
router.get('/', async (req, res) => {
  try {
    const { clientId } = req.query;

    const templates = await prisma.workoutTemplate.findMany({
      where: {
        OR: [
          { isGlobal: true },
          { userId: typeof clientId === 'string' ? clientId : undefined },
        ],
      },
      orderBy: [
        { sequenceNumber: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(templates);
  } catch (err) {
    console.error('GET /workout-templates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 GET /api/workout-templates/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const templates = await prisma.workoutTemplate.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: [
        { sequenceNumber: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(templates);
  } catch (err) {
    console.error('GET /workout-templates/user/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 GET /api/workout-templates/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.workoutTemplate.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            definition: true,
          },
        },
      },
    });

    if (!template) return res.status(404).json({ error: 'Not found' });

    const result = {
      ...template,
      exercises: template.exercises.map((ex) => ({
        exerciseId: ex.definition?.id || '',
        definition: {
          name: ex.definition?.name || 'Без названия',
          category: ex.definition?.category || '',
        },
        weight: ex.weight,
        reps: ex.reps,
        sets: ex.sets,
        comment: ex.comment,
      })),
    };

    res.json(result);
  } catch (err) {
    console.error('GET /workout-templates/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 POST /api/workout-templates
router.post('/', async (req, res) => {
  try {
    const { title, isGlobal, userId, exercises, sequenceNumber, isActive } = req.body;

    if (!title || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }

    const exerciseIds = exercises.map((e) => e.exerciseId);
    const found = await prisma.exerciseDefinition.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true },
    });

    if (found.length !== exerciseIds.length) {
      return res.status(400).json({ error: 'Некоторые упражнения не найдены' });
    }

    const created = await prisma.workoutTemplate.create({
      data: {
        title,
        isGlobal,
        sequenceNumber,
        isActive,
        userId: isGlobal ? null : userId,
        exercises: {
          create: exercises.map((ex) => ({
            weight: ex.weight,
            reps: ex.reps,
            sets: ex.sets,
            comment: ex.comment,
            definition: { connect: { id: ex.exerciseId } },
          })),
        },
      },
    });

    res.json(created);
  } catch (err) {
    console.error('POST /workout-templates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 PATCH /api/workout-templates/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isGlobal, exercises, sequenceNumber, isActive } = req.body;

    if (!title || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }

    await prisma.exercise.deleteMany({ where: { templateId: id } });

    const updated = await prisma.workoutTemplate.update({
      where: { id },
      data: {
        title,
        isGlobal,
        sequenceNumber,
        isActive,
        exercises: {
          create: exercises.map((ex) => ({
            weight: ex.weight,
            reps: ex.reps,
            sets: ex.sets,
            comment: ex.comment,
            definition: { connect: { id: ex.exerciseId } },
          })),
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('PATCH /workout-templates/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 PUT /api/workout-templates/:id — обновление только sequenceNumber / isActive
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sequenceNumber, isActive } = req.body;

    const updated = await prisma.workoutTemplate.update({
      where: { id },
      data: {
        ...(sequenceNumber !== undefined && { sequenceNumber }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT /workout-templates/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 DELETE /api/workout-templates/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.exercise.deleteMany({ where: { templateId: id } });
    await prisma.workoutTemplate.delete({ where: { id } });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('DELETE /workout-templates/:id error:', err);
    res.status(500).json({ error: 'Не удалось удалить шаблон' });
  }
});

export default router;
