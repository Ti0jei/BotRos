import {
  Container,
  Title,
  Card,
  Text,
  Button,
  Group,
  Stack,
  Badge,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getToken } from '../utils/auth';

interface Training {
  id: string;
  date: string;
  hour: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
}

export default function ClientSchedule({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState(() => dayjs().startOf('day'));
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  const loadTrainings = async () => {
    const res = await fetch(`${API}/api/trainings?date=${date.format('YYYY-MM-DD')}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error('Ошибка загрузки тренировок:', res.status);
      return;
    }

    const data = await res.json();
    setTrainings(data);
  };

  const updateStatus = async (id: string, status: 'CONFIRMED' | 'DECLINED') => {
    await fetch(`${API}/api/trainings/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    setEditingId(null);
    loadTrainings();
  };

  useEffect(() => {
    loadTrainings();
  }, [date]);

  return (
    <Container>
      <Title order={2} mb="md">Мои тренировки</Title>

      <Group mb="sm">
        <Button variant="default" onClick={() => setDate(date.subtract(1, 'day'))}>
          ← Назад
        </Button>
        <Button variant="default" onClick={() => setDate(date.add(1, 'day'))}>
          Вперёд →
        </Button>
      </Group>

      <Stack spacing="sm">
        {trainings.length === 0 ? (
          <Text>На выбранную дату нет тренировок.</Text>
        ) : (
          trainings.map((t) => (
            <Card key={t.id} withBorder shadow="xs" radius="md" p="md">
              <Group position="apart" mb="xs">
                <Text fw={500}>
                  {dayjs(t.date).format('DD.MM.YYYY')} в {t.hour}:00
                </Text>
                <Badge color={
                  t.status === 'CONFIRMED' ? 'green' :
                  t.status === 'DECLINED' ? 'red' : 'gray'
                }>
                  {t.status === 'CONFIRMED'
                    ? 'Приду'
                    : t.status === 'DECLINED'
                    ? 'Не приду'
                    : 'Ожидание'}
                </Badge>
              </Group>

              {t.status === 'PENDING' || editingId === t.id ? (
                <Group grow>
                  <Button
                    size="xs"
                    color="green"
                    variant="light"
                    onClick={() => updateStatus(t.id, 'CONFIRMED')}
                  >
                    ✅ Приду
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => updateStatus(t.id, 'DECLINED')}
                  >
                    ❌ Не приду
                  </Button>
                </Group>
              ) : (
                <>
                  <Text mt="xs">
                    {t.status === 'CONFIRMED'
                      ? '✅ Вы подтвердили участие'
                      : '🚫 Вы отказались от тренировки'}
                  </Text>
                  <Button
                    mt="xs"
                    size="xs"
                    variant="light"
                    color="blue"
                    onClick={() => setEditingId(t.id)}
                  >
                    Изменить решение
                  </Button>
                </>
              )}
            </Card>
          ))
        )}
      </Stack>

      <Button variant="subtle" mt="lg" fullWidth onClick={onBack}>
        ← Назад
      </Button>
    </Container>
  );
}
