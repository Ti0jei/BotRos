// frontend/pages/ClientSchedule.tsx
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

export default function ClientSchedule({ onBack, onOpenBlock }: { onBack: () => void; onOpenBlock: () => void }) {
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

    const filtered = data
      .filter((t: Training) => dayjs(t.date).add(t.hour, 'hour').isAfter(dayjs()))
      .sort((a, b) => {
        const d1 = dayjs(a.date).add(a.hour, 'hour');
        const d2 = dayjs(b.date).add(b.hour, 'hour');
        return d1.diff(d2);
      });

    setTrainings(filtered);
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
  }, []);

  const pinkButtonSx = {
    backgroundColor: 'transparent',
    color: '#d6336c',
    fontWeight: 500,
    border: '1px solid #d6336c',
    borderRadius: 8,
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#e8b3a6',
        paddingBottom: 80,
        paddingTop: 24,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: 420,
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderRadius: 24,
          boxShadow: '0 0 12px rgba(0,0,0,0.1)',
          padding: 20,
        }}
      >
        <Title order={2} ta="center" mb="md">
          Мои тренировки
        </Title>

        <Stack spacing="sm">
          {trainings.length === 0 ? (
            <>
              <Text ta="center" c="dimmed" mb="sm">
                У вас пока нет назначенных тренировок.
              </Text>
              <Button
                fullWidth
                leftIcon={<IconPackage size={18} />}
                onClick={onOpenBlock}
                sx={{
                  backgroundColor: '#d6336c',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#c0255c' },
                }}
              >
                Блок тренировок
              </Button>
            </>
          ) : (
            trainings.map((t) => (
              <Card key={t.id} withBorder radius="md" shadow="sm" p="md">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>
                    {dayjs(t.date).format('DD.MM.YYYY')} в {t.hour}:00
                  </Text>
                  <Badge color={
                    t.status === 'CONFIRMED' ? 'green' :
                    t.status === 'DECLINED' ? 'red' : 'gray'
                  }>
                    {t.status === 'CONFIRMED'
                      ? 'ПОДТВЕРЖДЕНО'
                      : t.status === 'DECLINED'
                      ? 'ОТМЕНЕНО'
                      : 'ОЖИДАНИЕ'}
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
      </Box>

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
          onClick={onBack}
          leftIcon={<IconArrowBack size={14} />}
          sx={pinkButtonSx}
        >
          Назад
        </Button>
      </Box>
    </Box>
  );
}
