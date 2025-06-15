import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Stack,
  Text,
  Loader,
  Button,
  Paper,
  Group,
  Badge,
} from '@mantine/core';

interface NutritionDay {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export default function ClientNutrition({
  userId,
  onBack,
}: {
  userId: string;
  onBack: () => void;
}) {
  const [data, setData] = useState<NutritionDay[]>([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/api/fatsecret/nutrition/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => {
        console.error('Ошибка загрузки питания:', err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Container py="xl">
      <Title order={2} mb="md">
        История питания
      </Title>

      {loading ? (
        <Loader />
      ) : data.length === 0 ? (
        <Text size="sm" color="dimmed">
          Нет данных по питанию
        </Text>
      ) : (
        <Stack spacing="sm">
          {data.map((entry) => (
            <Paper key={entry.date} withBorder p="md" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={500}>{entry.date}</Text>
                <Badge color="blue">{entry.calories} ккал</Badge>
              </Group>
              <Group gap="xs">
                <Badge color="green">Б: {entry.protein} г</Badge>
                <Badge color="yellow">Ж: {entry.fat} г</Badge>
                <Badge color="cyan">У: {entry.carbs} г</Badge>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      <Button variant="light" mt="lg" onClick={onBack}>
        ← Назад
      </Button>
    </Container>
  );
}
