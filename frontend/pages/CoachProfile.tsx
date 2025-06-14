import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Title,
  Paper,
  Text,
  Group,
  Badge,
  Loader,
} from '@mantine/core';
import dayjs from 'dayjs';
import { IconAlarm } from '@tabler/icons-react';
import { getToken } from '../utils/auth';

interface CoachProfileProps {
  profile: { name: string };
  onLogout: () => void;
  onOpenSchedule: () => void;
  onOpenClients?: () => void;
}

interface Training {
  id: string;
  hour: number;
  user: {
    name: string;
    lastName?: string | null;
    internalTag?: string | null;
  };
}

export default function CoachProfile({
  profile,
  onLogout,
  onOpenSchedule,
  onOpenClients,
}: CoachProfileProps) {
  const [nextTraining, setNextTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);

  const token = getToken();
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTrainings = async () => {
      setLoading(true);
      const today = dayjs().format('YYYY-MM-DD');
      const res = await fetch(`${API}/api/trainings?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const sorted = data
        .filter((t: any) => t.user)
        .sort((a: any, b: any) => a.hour - b.hour);
      setNextTraining(sorted[0] || null);
      setLoading(false);
    };

    fetchTrainings();
  }, []);

  return (
    <Container>
      <Title order={2} mb="lg">
        Привет, {profile.name} 👋
      </Title>

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

      <Button fullWidth mt="lg" color="red" onClick={onLogout}>
        Выйти
      </Button>

      {loading ? (
        <Group justify="center" mt="lg">
          <Loader size="sm" />
        </Group>
      ) : (
        nextTraining && (
          <Paper mt="lg" p="md" withBorder radius="md" shadow="xs">
            <Group mb="xs">
              <IconAlarm size={16} />
              <Text fw={500}>Ближайшая тренировка сегодня</Text>
            </Group>
            <Text>
              🕒 {nextTraining.hour}:00 — {nextTraining.user.name}{' '}
              {nextTraining.user.lastName || ''}{' '}
              {nextTraining.user.internalTag ? (
                <Text span color="dimmed">
                  ({nextTraining.user.internalTag})
                </Text>
              ) : null}
            </Text>
            <Badge mt="xs" color="yellow" size="sm">
              Ожидается
            </Badge>
          </Paper>
        )
      )}
    </Container>
  );
}
