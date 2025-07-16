import express from "express";
import prisma from "../prisma/index.mjs";
import { authMiddleware } from "../middleware/auth.mjs"; // ← исправлено

const router = express.Router();

// 🔹 Получить все упражнения
router.get("/", async (req, res) => {
  try {
    const exercises = await prisma.exerciseDefinition.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        category: true,
        createdAt: true,
        usedIn: {
          select: { id: true },
        },
      },
    });
    res.json(exercises);
  } catch (err) {
    console.error("❌ Ошибка при получении упражнений:", err);
    res.status(500).json({ error: "Ошибка сервера при получении списка" });
  }
});

// 🔹 Добавить новое упражнение
router.post("/", authMiddleware, async (req, res) => {
  const { name, category } = req.body;

  if (!name || typeof name !== "string" || name.length < 2) {
    return res.status(400).json({ error: "Некорректное имя упражнения" });
  }

  if (!category || typeof category !== "string") {
    return res.status(400).json({ error: "Некорректная категория" });
  }

  try {
    const existing = await prisma.exerciseDefinition.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(409).json({ error: "Упражнение с таким названием уже существует" });
    }

    const created = await prisma.exerciseDefinition.create({
      data: {
        name,
        category,
      },
    });

    res.json(created);
  } catch (err) {
    console.error("❌ Ошибка при создании упражнения:", err);
    res.status(500).json({ error: "Ошибка сервера при создании упражнения" });
  }
});

// 🔹 Удалить упражнение
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const exercise = await prisma.exerciseDefinition.findUnique({
      where: { id },
      include: { usedIn: true },
    });

    if (!exercise) {
      return res.status(404).json({ error: "Упражнение не найдено" });
    }

    if (exercise.usedIn.length > 0) {
      return res.status(400).json({ error: "Нельзя удалить — упражнение используется в шаблонах" });
    }

    await prisma.exerciseDefinition.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Ошибка при удалении упражнения:", err);
    res.status(500).json({ error: "Ошибка сервера при удалении" });
  }
});

export default router;
