// backend/routes/workoutTemplates.mjs
import { Router } from 'express';
import prisma from '../prisma/index.mjs';

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
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (err) {
    console.error('GET /workout-templates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 GET /api/workout-templates/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.workoutTemplate.findUnique({
      where: { id },
      include: { exercises: true },
    });
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (err) {
    console.error('GET /workout-templates/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔹 POST /api/workout-templates
router.post('/', async (req, res) => {
  try {
    const { title, isGlobal, userId, exercises } = req.body;

    const created = await prisma.workoutTemplate.create({
      data: {
        title,
        isGlobal,
        userId: isGlobal ? null : userId,
        exercises: {
          create: exercises.map((ex) => ({
            name: ex.name,
            weight: ex.weight,
            reps: ex.reps,
            sets: ex.sets,
            comment: ex.comment,
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
    const { title, isGlobal, exercises } = req.body;

    await prisma.exercise.deleteMany({ where: { templateId: id } });

    const updated = await prisma.workoutTemplate.update({
      where: { id },
      data: {
        title,
        isGlobal,
        exercises: {
          create: exercises.map((ex) => ({
            name: ex.name,
            weight: ex.weight,
            reps: ex.reps,
            sets: ex.sets,
            comment: ex.comment,
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

export default router;
