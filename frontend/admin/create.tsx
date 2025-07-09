// frontend/admin/create.tsx
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
  Accordion,
  NumberInput,
  Divider,
} from "@mantine/core";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ExerciseEntry {
  name: string;
  weight?: number;
  reps?: number;
  sets?: number;
  comment?: string;
}

export default function CreateWorkoutTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");

  const [title, setTitle] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const allExercises: Record<string, string[]> = {
    Спина: [
      "Вертикальная тяга",
      "Вертикальная тяга с бананами",
      "Горизонтальная тяга",
      "Горизонтальная тяга к груди",
      "Горизонтальная тяга в тренажере",
      "Тяга верхнего блока",
      "Тяга гантелей к поясу на скамье",
      "Тяга гантели унилатерально от скамьи",
      "Т - гриф",
      "Подтягивания",
    ],
    Грудь: [
      "Жим штанги (грудь)",
      "Жим в Смите (грудь)",
      "Жим гантелей  (грудь)",
      "Бабочка (грудь)",
      "Жим в тренажере (грудь)",
      "Отжимания в Смите",
    ],
    "Руки, плечи": [
      "Трицепс с канатом в низ",
      "Трицепс (катана)",
      "Бицепс с гантелями",
      "Бицепс в кроссовере",
      "Бицепс сидя с гантелями",
      "Бицепс унилатерально на скамье",
      "Предплечье",
      "Махи с гантелями",
      "Махи в кроссовере",
      "Махи унилатерально",
      "Махи унилатерально на скамье",
      "Махи с опорой о скамью",
      "Махи с опорой на ягодицы",
      "Тяга вверх с косичкой (передняя дельта)",
      "Бабочка (задняя дельта)",
      "Жим на переднюю дельту с гантелями",
      "Жим на переднюю дельту в тренажере",
    ],
    Низ: [
      "Ягодичный мост в тренажере",
      "Ягодичный мост в Смите",
      "Ягодичный мост со штангой",
      "Ягодичный мост на коврике",
      "Кик беки",
      "Кик беки на скамье",
      "Разведение бедра",
      "Сведение бедра",
      "Сплит присед",
      "Выпады в движение",
      "Болгарские выпады",
      "Присед в Смите",
      "Румынская тяга",
      "Румынская тяга в Смите",
      "Разгибание голени",
      "Сгибание голени",
      "Лягушка на коврике",
      "Жим платформу (средняя постановка)",
      "Жим платформы (узко и высоко)",
      "Жим платформы (узко и низко)",
      "Румынская тяга с гантелями",
      "Наклоны с гантелью унилатерально",
      "Экстензия",
      "Жим платформу унилатерально",
      "Икры в тренажере",
      "Икры с гирей на диске",
    ],
    Пресс: [],
  };

  const updateExercise = (name: string, field: keyof ExerciseEntry, value: any) => {
    setExercises((prev) => {
      const existing = prev.find((e) => e.name === name);
      if (existing) {
        return prev.map((e) =>
          e.name === name ? { ...e, [field]: value } : e
        );
      } else {
        return [...prev, { name, [field]: value }];
      }
    });
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      const body = {
        title,
        isGlobal,
        clientId: isGlobal ? null : clientId,
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
        navigate(-1);
      } else {
        alert("Ошибка при создании шаблона");
      }
    } catch (err) {
      console.error("Ошибка создания шаблона:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="xs" py="md">
      <Title order={3} mb="md">
        Создание шаблона
      </Title>

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

        <Divider my="md" label="Упражнения" labelPosition="center" />

        <Accordion multiple>
          {Object.entries(allExercises).map(([category, items]) => (
            <Accordion.Item key={category} value={category}>
              <Accordion.Control>{category}</Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  {items.map((name) => {
                    const entry = exercises.find((e) => e.name === name) || {};
                    return (
                      <div key={name} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 8 }}>
                        <Text fw={500} mb={4}>{name}</Text>
                        <Group grow>
                          <NumberInput
                            label="Вес"
                            value={entry.weight || 0}
                            onChange={(v) => updateExercise(name, "weight", v)}
                          />
                          <NumberInput
                            label="Повторы"
                            value={entry.reps || 0}
                            onChange={(v) => updateExercise(name, "reps", v)}
                          />
                          <NumberInput
                            label="Подходы"
                            value={entry.sets || 0}
                            onChange={(v) => updateExercise(name, "sets", v)}
                          />
                        </Group>
                        <Textarea
                          mt={6}
                          label="Комментарий"
                          value={entry.comment || ""}
                          onChange={(e) => updateExercise(name, "comment", e.currentTarget.value)}
                        />
                      </div>
                    );
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>

        <Group grow mt="md">
          <Button onClick={saveTemplate} loading={saving}>
            Создать
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Отмена
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}