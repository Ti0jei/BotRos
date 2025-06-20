import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Badge,
} from '@mantine/core';
import { IconArrowBack, IconPackage } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { getToken } from '../utils/auth';

interface Training {
  id: string;
  date: string;
  hour: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
}

export default function ClientSchedule({
  onBack,
  onOpenBlock,
}: {
  onBack: () => void;
  onOpenBlock: () => void;
}) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  const loadTrainings = async () => {
    const res = await fetch(`${API}/api/trainings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();

    const upcoming = data
      .filter((t: Training) =>
        dayjs(t.date).add(t.hour, 'hour').isAfter(dayjs())
      )
      .sort((a, b) => {
        const aTime = dayjs(a.date).add(a.hour, 'hour');
        const bTime = dayjs(b.date).add(b.hour, 'hour');
        return aTime.diff(bTime);
      });

    setTrainings(upcoming);
  };

  const updateStatus = async (
    id: string,
    status: 'CONFIRMED' | 'DECLINED'
  ) => {
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
  }, []);

  const pinkButtonSx = {
    backgroundColor: 'transparent',
    color: '#d6336c',
    fontWeight: 500,
    border: '1px solid #d6336c',
    borderRadius: 8,
    height: 36,
    padding: '0 14px',
    width: '100%',
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#e8b3a6',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Контент с прокруткой */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 16px 100px',
        }}
      >
        <Container size="xs">
          <Stack spacing="md">
            <Title order={2} ta="center">
              Мои тренировки
            </Title>

            <Button
              leftIcon={<IconPackage size={18} />}
              onClick={onOpenBlock}
              sx={{
                backgroundColor: '#d6336c',
                color: 'white',
                fontWeight: 600,
                borderRadius: 8,
                padding: '6px 18px',
                '&:hover': { backgroundColor: '#c0255c' },
              }}
            >
              📦 Блок тренировок
            </Button>

            {trainings.length === 0 ? (
              <Text ta="center" c="dimmed">
                У вас пока нет назначенных тренировок.
              </Text>
            ) : (
              trainings.map((t) => (
                <Card key={t.id} withBorder radius="md" shadow="sm" p="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>
                      {dayjs(t.date).format('DD.MM.YYYY')} в {t.hour}:00
                    </Text>
                    <Badge
                      color={
                        t.status === 'CONFIRMED'
                          ? 'green'
                          : t.status === 'DECLINED'
                          ? 'red'
                          : 'gray'
                      }
                    >
                      {t.status === 'CONFIRMED'
                        ? 'ПОДТВЕРЖДЕНО'
                        : t.status === 'DECLINED'
                        ? 'ОТМЕНЕНО'
                        : 'ОЖИДАНИЕ'}
                    </Badge>
                  </Group>

                  {t.status === 'PENDING' || editingId === t.id ? (
                    <Stack spacing="xs" mt="xs">
                      <Button
                        fullWidth
                        size="xs"
                        color="green"
                        variant="light"
                        onClick={() => updateStatus(t.id, 'CONFIRMED')}
                      >
                        ✅ Приду
                      </Button>
                      <Button
                        fullWidth
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={() => updateStatus(t.id, 'DECLINED')}
                      >
                        ❌ Не приду
                      </Button>
                    </Stack>
                  ) : (
                    <>
                      <Text mt="xs" size="sm" c="dimmed">
                        {t.status === 'CONFIRMED'
                          ? '✅ Вы подтвердили участие'
                          : '🚫 Вы отказались от тренировки'}
                      </Text>
                      <Button
                        mt="xs"
                        size="xs"
                        variant="light"
                        color="blue"
                        fullWidth
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
        </Container>
      </Box>

      {/* Нижняя фиксированная кнопка */}
      <Box
        sx={{
          position: 'relative',
          padding: '10px 0',
          background: 'white',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <Container size="xs">
          <Button
            variant="subtle"
            onClick={onBack}
            leftIcon={<IconArrowBack size={14} />}
            sx={pinkButtonSx}
          >
            Назад к профилю
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
