import { useEffect, useState } from "react";
import {
  Container,
  Title,
  TextInput,
  Button,
  Stack,
  Group,
  Badge,
  Divider,
  ActionIcon,
  Box,
} from "@mantine/core";
import { IconTrash, IconReload, IconChevronLeft } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";

interface Exercise {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  usedIn: { id: string }[];
}

export default function ExercisesPage({ onBack }: { onBack: () => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/exercises`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExercises(data);
    } catch (err) {
      showNotification({
        title: "Ошибка",
        message: "Не удалось загрузить упражнения",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const createExercise = async () => {
    if (!name.trim() || !category.trim()) return;

    try {
      const res = await fetch(`${API}/api/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), category: category.trim() }),
      });

      if (res.ok) {
        showNotification({
          title: "✅ Упражнение добавлено",
          message: name,
          color: "green",
        });
        setName("");
        setCategory("");
        fetchExercises();
      } else {
        const error = await res.json();
        showNotification({
          title: "Ошибка",
          message: error.error || "Не удалось создать упражнение",
          color: "red",
        });
      }
    } catch {
      showNotification({
        title: "Ошибка",
        message: "Сервер недоступен",
        color: "red",
      });
    }
  };

  const deleteExercise = async (id: string) => {
    if (!window.confirm("Удалить это упражнение?")) return;

    try {
      const res = await fetch(`${API}/api/exercises/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (res.ok) {
        showNotification({
          title: "✅ Удалено",
          message: "Упражнение удалено",
          color: "green",
        });
        fetchExercises();
      } else {
        showNotification({
          title: "Ошибка",
          message: result.error || "Не удалось удалить",
          color: "red",
        });
      }
    } catch {
      showNotification({
        title: "Ошибка",
        message: "Ошибка сервера при удалении",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const buttonStyle = {
    root: {
      color: "#1a1a1a",
      border: "1px solid #1a1a1a",
      borderRadius: 12,
      fontWeight: 500,
      backgroundColor: "#fff",
      transition: "background 0.2s",
      padding: "10px 16px",
      whiteSpace: "normal",
      textAlign: "center",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  return (
    <Box style={{ backgroundColor: "#f7f7f7", minHeight: "100vh", paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={3} mb="md">
          Управление упражнениями
        </Title>

        <Stack spacing="sm">
          <TextInput
            label="Название"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && createExercise()}
          />
          <TextInput
            label="Категория"
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && createExercise()}
          />
          <Group grow wrap="wrap">
            <Button
              onClick={createExercise}
              disabled={!name.trim() || !category.trim()}
              variant="outline"
              styles={buttonStyle}
            >
              Добавить
            </Button>
            <Button
              onClick={fetchExercises}
              leftIcon={<IconReload size={16} />}
              variant="outline"
              styles={buttonStyle}
            >
              Обновить список
            </Button>
          </Group>
        </Stack>

        <Divider my="lg" />

        <Stack spacing="sm">
          {exercises.map((ex) => (
            <Group key={ex.id} position="apart">
              <div>
                <strong>{ex.name}</strong>{" "}
                <Badge color="gray" size="sm">{ex.category}</Badge>
                {ex.usedIn.length > 0 && (
                  <Badge color="blue" size="sm" ml="xs">
                    Используется
                  </Badge>
                )}
              </div>
              <ActionIcon
                onClick={() => deleteExercise(ex.id)}
                color="red"
                variant="outline"
                disabled={ex.usedIn.length > 0}
                title={
                  ex.usedIn.length > 0
                    ? "Упражнение используется — удалить нельзя"
                    : "Удалить упражнение"
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          {exercises.length === 0 && (
            <Badge color="gray" variant="light">
              Нет упражнений
            </Badge>
          )}
        </Stack>
      </Container>

      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "white",
          padding: "10px 16px",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
          zIndex: 1000,
        }}
      >
        <Box style={{ maxWidth: 420, margin: "0 auto" }}>
          <Button
            onClick={onBack}
            variant="outline"
            fullWidth
            styles={buttonStyle}
            leftIcon={<IconChevronLeft size={16} />}
          >
            Назад к клиентам
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
