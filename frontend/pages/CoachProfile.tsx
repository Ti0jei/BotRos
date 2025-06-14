import { useEffect, useState } from 'react';
import { Button, Container, Title, Paper, Text, Group, Badge } from '@mantine/core';

interface CoachProfileProps {
  profile: { name: string };
  onLogout: () => void;
  onOpenSchedule: () => void;
  onOpenClients?: () => void;
}

interface Training {
  id: string;
  date: string;
  hour: number;
  user: {
    name: string;
    lastName?: string;
    internalTag?: string;
  };
  isSinglePaid: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
}

export default function CoachProfile({ profile, onLogout, onOpenSchedule, onOpenClients }: CoachProfileProps) {
  const [nextTraining, setNextTraining] = useState<Training | null>(null);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadNext = async () => {
      const res = await fetch(`${API}/api/trainings/next`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNextTraining(data);
      }
    };

    loadNext();
  }, []);

  return (
    <Container>
      <Title order={2} mb="lg">Привет, Кристиночка 👋</Title>

      <Button fullWidth mb="sm" color="blue" onClick={onOpenClients}>
        Клиенты
      </Button>

      <Button fullWidth mb="sm" color="blue" onClick={onOpenSchedule}>
        Назначить тренировку
      </Button>

      <Button fullWidth mb="sm" disabled>
        Питание клиентов (скоро)
      </Button>

      <Button fullWidth mb="sm" disabled>
        Материалы (скоро)
      </Button>

      {nextTraining && (
        <Paper withBorder shadow="xs" radius="md" p="md" mt="lg" mb="sm">
          <Group position="apart" mb="xs">
            <Text fw={600}>Ближайшая тренировка</Text>
            <Badge color="blue">
              {new Date(nextTraining.date).toLocaleDateString()} в {nextTraining.hour}:00
            </Badge>
          </Group>
          <Text>
            {nextTraining.user.name} {nextTraining.user.lastName ?? ''}{' '}
            {nextTraining.user.internalTag && (
              <Text span color="dimmed">({nextTraining.user.internalTag})</Text>
            )}
          </Text>
        </Paper>
      )}

      <Button fullWidth mt="lg" color="red" onClick={onLogout}>
        Выйти
      </Button>
    </Container>
  );
}
