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
  Collapse,
} from '@mantine/core';
import dayjs from 'dayjs';
import { IconAlarm, IconClock } from '@tabler/icons-react';
import { getToken } from '../utils/auth';
import InviteCodeViewer from '../components/InviteCodeViewer';

interface CoachProfileProps {
  profile: { name: string };
  onLogout: () => void;
  onOpenSchedule: () => void;
  onOpenClients?: () => void;
}

interface Training {
  id: string;
  hour: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  user: {
    id: string;
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
  const [upcomingTrainings, setUpcomingTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false); // ✅ новое состояние

  const token = getToken();
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTrainings = async () => {
      setLoading(true);
      const today = dayjs().format('YYYY-MM-DD');
      const res = await fetch(`${API}/api/trainings?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Training[] = await res.json();

      const valid = data.filter(
        (t) => t.status === 'PENDING' || t.status === 'CONFIRMED'
      );

      const sorted = valid.sort((a, b) => a.hour - b.hour);
      const nextHour = sorted.length > 0 ? sorted[0].hour : null;

      const filtered = nextHour !== null
        ? sorted.filter((t) => t.hour === nextHour)
        : [];

      setUpcomingTrainings(filtered);
      setLoading(false);
    };

    fetchTrainings();
  }, []);

  const sendReminder = async (trainingId: string) => {
    await fetch(`${API}/api/notifications/remind/${trainingId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

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

      {/* ✅ Кнопка для показа/скрытия инвайт-кода */}
      <Button
        fullWidth
        variant="outline"
        color="gray"
        onClick={() => setShowCode((prev) => !prev)}
        mb="md"
      >
        {showCode ? 'Скрыть код для регистрации' : 'Код для регистрации'}
      </Button>

      <Collapse in={showCode}>
        <Paper p="md" withBorder radius="md" shadow="xs" mb="md">
          <Title order={4} mb="sm">Код для регистрации клиентов</Title>
          <InviteCodeViewer />
        </Paper>
      </Collapse>

      <Button fullWidth mt="lg" color="red" onClick={onLogout}>
        Выйти
      </Button>

      {loading ? (
        <Group justify="center" mt="lg">
          <Loader size="sm" />
        </Group>
      ) : (
        upcomingTrainings.length > 0 && (
          <Paper mt="lg" p="md" withBorder radius="md" shadow="xs">
            <Group mb="xs">
              <IconAlarm size={18} />
              <Text fw={600}>Ближайшие тренировки сегодня</Text>
            </Group>

            {upcomingTrainings.map((t) => (
              <Group key={t.id} position="apart" mb="xs">
                <Group spacing="xs">
                  <IconClock size={16} />
                  <Text size="sm">
                    {t.hour}:00 — {t.user.name} {t.user.lastName ?? ''}
                    {t.user.internalTag && (
                      <Text span color="dimmed"> ({t.user.internalTag})</Text>
                    )}
                  </Text>
                </Group>
                <Group spacing="xs">
                  <Badge
                    color={t.status === 'CONFIRMED' ? 'green' : 'orange'}
                    size="sm"
                  >
                    {t.status === 'CONFIRMED' ? 'Подтверждено' : 'Ожидается'}
                  </Badge>
                  {t.status === 'PENDING' && (
                    <Button
                      size="xs"
                      variant="outline"
                      color="orange"
                      onClick={() => sendReminder(t.id)}
                    >
                      Напомнить
                    </Button>
                  )}
                </Group>
              </Group>
            ))}
          </Paper>
        )
      )}
    </Container>
  );
}
