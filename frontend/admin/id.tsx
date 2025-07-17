import { useEffect, useState } from "react";
import {
  Container,
  Title,
  TextInput,
  Checkbox,
  Button,
  Loader,
  Stack,
  Group,
  Text,
  Textarea,
  NumberInput,
  Box,
  Select,
  Collapse,
  ActionIcon,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";

interface ExerciseDefinition {
  id: string;
  name: string;
  category: string;
}

interface ExerciseEntry {
  id: string;
  exerciseId: string;
  definition: {
    name: string;
  };
  weight?: number;
  reps?: number;
  sets?: number;
  comment?: string;
}

export default function EditWorkoutTemplate({
  templateId,
  setView,
}: {
  templateId: string;
  setView: (v: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [definitions, setDefinitions] = useState<ExerciseDefinition[]>([]);
  const [newExerciseId, setNewExerciseId] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState(0);
  const [newReps, setNewReps] = useState(0);
  const [newSets, setNewSets] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [openedId, setOpenedId] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const [tplRes, defsRes] = await Promise.all([
          fetch(`${API}/api/workout-templates/${templateId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/exercises`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const tpl = await tplRes.json();
        const defs = await defsRes.json();

        setTitle(tpl.title);
        setIsGlobal(tpl.isGlobal);
        setDefinitions(defs);

        setExercises(
          (tpl.exercises || []).map((e: any) => ({
            id: uuidv4(),
            exerciseId: e.exerciseId,
            definition: {
              name: e.definition?.name || "Без названия",
            },
            weight: e.weight,
            reps: e.reps,
            sets: e.sets,
            comment: e.comment,
          }))
        );
      } catch (err) {
        console.error("Ошибка загрузки шаблона:", err);
        setError("Не удалось загрузить шаблон");
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, [templateId]);

  const saveChanges = async () => {
    if (!title.trim()) {
      alert("Введите название программы");
      return;
    }

    setSaving(true);
    try {
      const payload = exercises.map(({ id, definition, ...rest }) => rest);
      const res = await fetch(`${API}/api/workout-templates/${templateId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, isGlobal, exercises: payload }),
      });

      if (res.ok) {
        setView("workouts");
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (err) {
      console.error("Ошибка PATCH шаблона", err);
    } finally {
      setSaving(false);
    }
  };

  const addExercise = () => {
    if (!newExerciseId) return;
    const def = definitions.find((d) => d.id === newExerciseId);
    if (!def) return;

    setExercises((prev) => [
      ...prev,
      {
        id: uuidv4(),
        exerciseId: newExerciseId,
        definition: { name: def.name },
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

  const removeExercise = (id: string) => {
    if (window.confirm("Удалить упражнение?")) {
      setExercises((prev) => prev.filter((ex) => ex.id !== id));
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setExercises((prev) => {
      const newList = [...prev];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      return newList;
    });
  };

  const moveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    setExercises((prev) => {
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      return newList;
    });
  };

  const exerciseOptions = definitions.map((def) => ({
    value: def.id,
    label: `${def.name} (${def.category})`,
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
      <Title order={3} mb="md">Редактирование программы тренировок</Title>

      {loading ? (
        <Loader size="sm" />
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : (
        <Stack>
          <TextInput label="Название программы" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
          <Checkbox label="Общедоступная программа (для всех клиентов)" checked={isGlobal} onChange={(e) => setIsGlobal(e.currentTarget.checked)} />

          <Title order={5} mt="md">Добавить упражнение</Title>

          <Select label="Упражнение" data={exerciseOptions} searchable clearable value={newExerciseId} onChange={(v) => setNewExerciseId(v)} placeholder="Выберите упражнение" />

          <Group grow>
            <NumberInput label="Вес (кг)" value={newWeight} onChange={(v) => setNewWeight(v || 0)} min={0} />
            <NumberInput label="Повторы" value={newReps} onChange={(v) => setNewReps(v || 0)} min={0} />
            <NumberInput label="Подходы" value={newSets} onChange={(v) => setNewSets(v || 0)} min={0} />
          </Group>

          <Textarea label="Комментарий" value={newComment} onChange={(e) => setNewComment(e.currentTarget.value)} />
          <Button onClick={addExercise} styles={buttonStyle}>Добавить</Button>

          <Title order={5} mt="md">Упражнения</Title>

          {exercises.length === 0 ? (
            <Text size="sm" c="dimmed">Упражнений пока нет</Text>
          ) : (
            <Stack spacing="sm">
              {exercises.map((ex, index) => (
                <Box
                  key={ex.id}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: 10,
                    padding: 12,
                    backgroundColor: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    gap: 12,
                  }}
                >
                  <Stack spacing={4} align="center" mt={6}>
                    <ActionIcon variant="transparent" color="black" onClick={() => moveUp(index)}>
                      <IconArrowUp size={16} />
                    </ActionIcon>
                    <ActionIcon variant="transparent" color="black" onClick={() => moveDown(index)}>
                      <IconArrowDown size={16} />
                    </ActionIcon>
                  </Stack>

                  <Box style={{ flexGrow: 1, position: "relative" }}>
                    <Text fw={500} mb={4}>{ex.definition.name}</Text>

                    <Collapse in={openedId === ex.id}>
                      <Group grow mb={4}>
                        <NumberInput label="Вес" value={ex.weight || 0} onChange={(v) =>
                          setExercises((prev) =>
                            prev.map((item) => item.id === ex.id ? { ...item, weight: v || 0 } : item)
                          )
                        } min={0} />
                        <NumberInput label="Повторы" value={ex.reps || 0} onChange={(v) =>
                          setExercises((prev) =>
                            prev.map((item) => item.id === ex.id ? { ...item, reps: v || 0 } : item)
                          )
                        } min={0} />
                        <NumberInput label="Подходы" value={ex.sets || 0} onChange={(v) =>
                          setExercises((prev) =>
                            prev.map((item) => item.id === ex.id ? { ...item, sets: v || 0 } : item)
                          )
                        } min={0} />
                      </Group>

                      <Textarea
                        label="Комментарий"
                        value={ex.comment || ""}
                        onChange={(e) =>
                          setExercises((prev) =>
                            prev.map((item) =>
                              item.id === ex.id ? { ...item, comment: e.currentTarget.value } : item
                            )
                          )
                        }
                      />
                    </Collapse>

                    <Group spacing={6} position="right" mt={6}>
                      <ActionIcon variant="transparent" color="black" onClick={() => setOpenedId(openedId === ex.id ? null : ex.id)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="transparent" color="black" onClick={() => removeExercise(ex.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}

          <Group grow mt="md">
            <Button onClick={saveChanges} loading={saving} styles={buttonStyle}>Сохранить</Button>
            <Button variant="outline" onClick={() => setView("workouts")} styles={buttonStyle}>Отмена</Button>
          </Group>
        </Stack>
      )}
    </Container>
  );
}
