import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Badge,
} from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';
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

  const outlinePinkButtonStyle = {
    root: {
      border: '1.5px solid #d6336c',
      color: '#d6336c',
      backgroundColor: 'transparent',
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 15,
      height: 44,
      transition: 'background 0.2s',
      '&:hover': {
        backgroundColor: '#ffe3ed',
      },
    },
  };

  const softGreenButton = {
    root: {
      backgroundColor: '#e6f4ea',
      color: 'green',
      fontWeight: 500,
      borderRadius: 10,
      height: 36,
      fontSize: 14,
      '&:hover': { backgroundColor: '#d3f0dc' },
    },
  };

  const softRedButton = {
    root: {
      backgroundColor: '#ffe5e8',
      color: '#d6336c',
      fontWeight: 500,
      borderRadius: 10,
      height: 36,
      fontSize: 14,
      '&:hover': { backgroundColor: '#ffd6dc' },
    },
  };

  return (
    <>
      <Box
        style={{
          backgroundColor: '#f5d4ca',
          minHeight: '100vh',
          padding: '32px 16px 100px',
        }}
      >
        <Box style={{ maxWidth: 420, margin: '0 auto' }}>
          <Stack spacing="lg">
            <Title order={2} ta="center">
              Мои тренировки
            </Title>

            <Button
              onClick={onOpenBlock}
              leftIcon={<IconPackage size={20} />}
              styles={outlinePinkButtonStyle}
              fullWidth
            >
              📦 Блок тренировок
            </Button>

            {trainings.length === 0 ? (
              <Text ta="center" c="dimmed">
                У вас пока нет назначенных тренировок.
              </Text>
            ) : (
              trainings.map((t) => (
                <Box
                  key={t.id}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    border: '1px solid #f3d3df',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  }}
                >
                  <Group justify="space-between" mb="xs">
                    <Text fw={600}>
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
                      size="lg"
                      radius="sm"
                      variant="light"
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
                        onClick={() => updateStatus(t.id, 'CONFIRMED')}
                        styles={softGreenButton}
                      >
                        ✅ Приду
                      </Button>
                      <Button
                        fullWidth
                        onClick={() => updateStatus(t.id, 'DECLINED')}
                        styles={softRedButton}
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
                </Box>
              ))
            )}
          </Stack>
        </Box>
      </Box>

      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#f5d4ca',
          padding: '12px 16px',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
          zIndex: 1000,
        }}
      >
        <Box style={{ maxWidth: 420, margin: '0 auto' }}>
          <Button
            fullWidth
            onClick={onBack}
            styles={outlinePinkButtonStyle}
            leftIcon={<span style={{ fontSize: 18 }}>←</span>}
          >
            Назад к профилю
          </Button>
        </Box>
      </Box>
    </>
  );
}
