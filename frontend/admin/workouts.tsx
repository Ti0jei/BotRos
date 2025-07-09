// frontend/admin/workouts.tsx
import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Button,
  Stack,
  Group,
  Loader,
  Badge,
  Box,
} from "@mantine/core";
import { useSearchParams, useNavigate } from "react-router-dom";

interface WorkoutTemplate {
  id: string;
  title: string;
  isGlobal: boolean;
  clientId?: string | null;
}

export default function WorkoutTemplatesPage() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const clientId = searchParams.get("clientId");

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/api/workout-templates?clientId=${clientId ?? ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setTemplates(data || []);
      } catch (err) {
        console.error("Ошибка загрузки шаблонов:", err);
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [clientId]);

  return (
    <Container size="xs" py="md">
      <Title order={3} mb="md">
        Шаблоны тренировок
      </Title>

      {loading ? (
        <Loader size="sm" />
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : templates.length === 0 ? (
        <Text size="sm" color="dimmed">
          Нет шаблонов для отображения.
        </Text>
      ) : (
        <Stack spacing="sm">
          {templates.map((tpl) => (
            <Card key={tpl.id} withBorder shadow="xs" radius="md" p="sm">
              <Group position="apart">
                <Text fw={500}>{tpl.title}</Text>
                <Badge color={tpl.isGlobal ? "blue" : "gray"}>
                  {tpl.isGlobal ? "Общий" : "Личный"}
                </Badge>
              </Group>
              <Button
                variant="outline"
                size="xs"
                fullWidth
                mt="sm"
                onClick={() => navigate(`/admin/workouts/edit/${tpl.id}`)}
              >
                Редактировать
              </Button>
            </Card>
          ))}
        </Stack>
      )}

      <Box mt="lg">
        <Button fullWidth variant="outline" onClick={() => window.history.back()}>
          Назад
        </Button>
      </Box>
    </Container>
  );
}