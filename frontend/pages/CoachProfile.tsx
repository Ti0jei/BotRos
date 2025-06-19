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
  Center,
  Stack,
  Box,
  Divider,
} from '@mantine/core';
import dayjs from 'dayjs';
import {
  IconAlarm,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconLogout,
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
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
  const [showCode, setShowCode] = useState(false);

  const token = getToken();
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setLoading(true);
        const today = dayjs().format('YYYY-MM-DD');
        const res = await fetch(`${API}/api/trainings?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Ошибка загрузки тренировок');

        const data: Training[] = await res.json();
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const filtered = data
          .filter((t) => {
            const timeMin = t.hour * 60;
            return (t.status === 'PENDING' || t.status === 'CONFIRMED') && timeMin > currentMinutes;
          })
          .sort((a, b) => a.hour - b.hour);

        const nextHour = filtered.length > 0 ? filtered[0].hour : null;
        setUpcomingTrainings(nextHour !== null ? filtered.filter((t) => t.hour === nextHour) : []);
      } catch (err) {
        console.error('Ошибка при получении тренировок:', err);
        showNotification({
          title: 'Ошибка',
          message: 'Не удалось загрузить ближайшие тренировки',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const sendReminder = async (trainingId: string) => {
    try {
      const res = await fetch(`${API}/api/notifications/remind/${trainingId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      showNotification({
        title: 'Напоминание отправлено',
        message: 'Клиенту отправлено уведомление',
        color: 'green',
      });
    } catch {
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось отправить напоминание',
        color: 'red',
      });
    }
  };

  const pinkButtonStyle = {
    root: {
      color: '#d6336c',
      borderRadius: 8,
      '&:hover': { backgroundColor: '#ffe3ed' },
    },
  };

  return (
    <Box style={{ backgroundColor: '#f5d4ca', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Paper
          p="md"
          radius="lg"
          shadow="md"
          withBorder
          style={{
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <Stack spacing="sm">
            <Title order={3} ta="center">
              Привет, {profile.name} 👋
            </Title>

            <Button fullWidth onClick={onOpenClients} variant="subtle" styles={pinkButtonStyle}>
              Клиенты
            </Button>

            <Button fullWidth onClick={onOpenSchedule} variant="subtle" styles={pinkButtonStyle}>
              Назначить тренировку
            </Button>

            <Button fullWidth disabled variant="light" color="gray">
              Питание клиентов (скоро)
            </Button>

            <Button fullWidth disabled variant="light" color="gray">
              Материалы (скоро)
            </Button>
          </Stack>
        </Paper>

        <Divider my="lg" />

        {loading ? (
          <Center mt="lg">
            <Loader size="sm" />
          </Center>
        ) : upcomingTrainings.length > 0 ? (
          <Paper mt="sm" p="md" radius="md" shadow="xs" withBorder>
            <Group mb="xs">
              <IconAlarm size={18} />
              <Text fw={600}>Ближайшие тренировки сегодня</Text>
            </Group>

            <Stack spacing="sm">
              {upcomingTrainings.map((t) => (
                <Paper key={t.id} p="sm" radius="md" withBorder>
                  <Group position="apart">
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
                          variant="subtle"
                          styles={pinkButtonStyle}
                          onClick={() => sendReminder(t.id)}
                        >
                          Напомнить
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Paper>
        ) : (
          <Text mt="lg" ta="center" color="dimmed">
            Сегодня пока нет запланированных тренировок
          </Text>
        )}

        <Divider my="lg" />

        <Button
          fullWidth
          variant="subtle"
          onClick={() => setShowCode((p) => !p)}
          rightIcon={showCode ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          styles={pinkButtonStyle}
        >
          {showCode ? 'Скрыть код для регистрации' : 'Показать код для регистрации'}
        </Button>

        <Collapse in={showCode}>
          <Paper mt="sm" p="md" radius="md" withBorder>
            <Title order={4} mb="xs">Код для регистрации</Title>
            <InviteCodeViewer />
          </Paper>
        </Collapse>

        <Box
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'white',
            padding: '10px 0',
            textAlign: 'center',
            boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
            zIndex: 1000,
          }}
        >
          <Button
            variant="subtle"
            size="sm"
            onClick={onLogout}
            leftIcon={<IconLogout size={16} />}
            styles={pinkButtonStyle}
          >
            Выйти
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
