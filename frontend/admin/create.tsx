import { useEffect, useState } from "react";
import {
  Container,
  Title,
  TextInput,
  Checkbox,
  Button,
  Stack,
  Group,
  NumberInput,
  Textarea,
  Select,
  Card,
  Divider,
  Text,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";

interface ExerciseDefinition {
  id: string;
  name: string;
  category: string;
}

interface ExerciseEntry {
  exerciseId: string;
  weight?: number;
  reps?: number;
  sets?: number;
  comment?: string;
}

export default function CreateWorkoutTemplate({
  clientId,
  onCancel,
}: {
  clientId: string | null;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [definitions, setDefinitions] = useState<ExerciseDefinition[]>([]);
  const [newExerciseId, setNewExerciseId] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState(0);
  const [newReps, setNewReps] = useState(0);
  const [newSets, setNewSets] = useState(0);
  const [newComment, setNewComment] = useState("");

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchDefinitions = async () => {
    try {
      const res = await fetch(`${API}/api/exercises`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDefinitions(data);
    } catch {
      showNotification({
        title: "Ошибка",
        message: "Не удалось загрузить список упражнений",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  const addExercise = () => {
    if (!newExerciseId) {
      showNotification({
        title: "Ошибка",
        message: "Выберите упражнение",
        color: "red",
      });
      return;
    }

    const def = definitions.find((d) => d.id === newExerciseId);
    if (!def) {
      showNotification({
        title: "Ошибка",
        message: "Упражнение не найдено в списке",
        color: "red",
      });
      return;
    }

    setExercises((prev) => [
      ...prev,
      {
        exerciseId: def.id,
        weight: newWeight,
        reps: newReps,
        sets: newSets,
        comment: newComment,
      },
    ]);

    setNewExerciseId(null);
    setNewWeight(0);
    setNewReps(0);
    setNewSets(0);
    setNewComment("");
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const saveTemplate = async () => {
    if (!title.trim()) {
      showNotification({
        title: "Ошибка",
        message: "Введите название шаблона",
        color: "red",
      });
      return;
    }

    if (exercises.length === 0) {
      showNotification({
        title: "Ошибка",
        message: "Добавьте хотя бы одно упражнение",
        color: "red",
      });
      return;
    }

    if (!isGlobal && !clientId) {
      showNotification({
        title: "Ошибка",
        message: "ID клиента обязателен для личного шаблона",
        color: "red",
      });
      return;
    }

    setSaving(true);
    try {
      const body = {
        title,
        isGlobal,
        userId: isGlobal ? null : clientId,
        exercises,
      };

      const res = await fetch(`${API}/api/workout-templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showNotification({
          title: "✅ Успешно",
          message: "Шаблон создан",
          color: "green",
        });
        setTimeout(() => onCancel(), 800);
      } else {
        const err = await res.json();
        console.error("Ответ сервера:", err);
        showNotification({
          title: "Ошибка",
          message: err?.error || "Не удалось создать шаблон",
          color: "red",
        });
      }
    } catch (err) {
      console.error("Ошибка создания шаблона:", err);
      showNotification({
        title: "Ошибка",
        message: "Ошибка сервера",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const exerciseOptions = definitions.map((ex) => ({
    label: `${ex.name} (${ex.category})`,
    value: ex.id,
  }));

  const buttonStyle = {
    root: {
      color: "#1a1a1a",
      border: "1px solid #1a1a1a",
      borderRadius: 12,
      fontWeight: 500,
      backgroundColor: "#fff",
      transition: "background 0.2s",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  return (
    <Container size="xs" py="md">
      <Title order={3} mb="md">Создание шаблона</Title>

      <Stack>
        <TextInput
          label="Название шаблона"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
        />

        <Checkbox
          label="Общий шаблон (для всех клиентов)"
          checked={isGlobal}
          onChange={(e) => setIsGlobal(e.currentTarget.checked)}
        />

        <Divider my="md" label="Добавить" labelPosition="center" />

        <Stack spacing="xs">
          <Select
            label="Упражнение"
            data={exerciseOptions}
            searchable
            clearable
            value={newExerciseId}
            onChange={(value) => setNewExerciseId(value)}
            placeholder="Выберите упражнение"
            nothingFound="Не найдено"
          />

          <Group grow>
            <NumberInput
              label="Вес (кг)"
              min={0}
              value={newWeight}
              onChange={(v) => setNewWeight(v || 0)}
            />
            <NumberInput
              label="Повторы"
              min={0}
              value={newReps}
              onChange={(v) => setNewReps(v || 0)}
            />
            <NumberInput
              label="Подходы"
              min={0}
              value={newSets}
              onChange={(v) => setNewSets(v || 0)}
            />
          </Group>

          <Textarea
            label="Комментарий"
            value={newComment}
            onChange={(e) => setNewComment(e.currentTarget.value)}
          />

          <Button
            leftIcon={<IconPlus size={16} />}
            styles={buttonStyle}
            onClick={addExercise}
          >
            Добавить
          </Button>
        </Stack>

        <Divider my="md" label="Упражнения в шаблоне" labelPosition="center" />

        {exercises.map((ex, i) => {
          const def = definitions.find((d) => d.id === ex.exerciseId);
          return (
            <Card key={i} withBorder shadow="xs" radius="md" p="sm">
              <Group position="apart">
                <Text fw={500}>{def?.name ?? "???"}</Text>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => removeExercise(i)}
                  leftIcon={<IconTrash size={14} />}
                >
                  Удалить
                </Button>
              </Group>
              <Text size="sm" mt={4}>
                Вес: {ex.weight ?? 0} кг, Повторы: {ex.reps ?? 0}, Подходы: {ex.sets ?? 0}
              </Text>
              {ex.comment && (
                <Text size="sm" c="dimmed" mt={2}>
                  Комментарий: {ex.comment}
                </Text>
              )}
            </Card>
          );
        })}

        <Group grow mt="md">
          <Button onClick={saveTemplate} loading={saving} styles={buttonStyle}>
            Создать
          </Button>
          <Button variant="outline" styles={buttonStyle} onClick={onCancel}>
            Отмена
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
