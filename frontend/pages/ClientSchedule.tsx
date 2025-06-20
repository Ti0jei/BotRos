import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
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

  // Универсальный стиль для кнопок с рамкой
  const pinkButtonSx = {
    backgroundColor: 'transparent',
    color: '#d6336c',
    fontWeight: 500,
    border: '1px solid #d6336c',
    borderRadius: 8,
    height: 36,
    width: '100%',
    fontSize: 16,
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
    transition: 'background 0.15s',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#e8b3a6',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Центрированная карточка */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowY: 'auto',
          paddingTop: 48,
          paddingBottom: 150,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(255,255,255,0.94)',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            padding: '32px 20px 32px 20px',
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Title order={2} ta="center" mb={20}>
            Мои тренировки
          </Title>

          <Button
            leftIcon={<IconPackage size={18} />}
            onClick={onOpenBlock}
            sx={{
              ...pinkButtonSx,
              marginBottom: 20,
              maxWidth: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 500,
            }}
          >
            📦 Блок тренировок
          </Button>

          <Stack spacing="md" w="100%" align="stretch">
            {trainings.length === 0 ? (
              <Text ta="center" c="dimmed">
                У вас пока нет назначенных тренировок.
              </Text>
            ) : (
              trainings.map((t) => (
                <Card
                  key={t.id}
                  withBorder
                  radius="md"
                  shadow="sm"
                  p="md"
                  sx={{
                    marginBottom: 6,
                    background: 'white',
                    border: '1px solid #f3d3df',
                  }}
                >
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
                        sx={{ fontWeight: 500 }}
                      >
                        ✅ Приду
                      </Button>
                      <Button
                        fullWidth
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={() => updateStatus(t.id, 'DECLINED')}
                        sx={{ fontWeight: 500 }}
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
        </Card>
      </Box>

      {/* Фиксированная кнопка "На главную" */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'white',
          padding: '12px 0',
          textAlign: 'center',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
          zIndex: 1000,
        }}
      >
        <Box sx={{ maxWidth: 420, margin: '0 auto', padding: '0 20px' }}>
          <Button
            variant="subtle"
            onClick={onBack}
            leftIcon={<IconArrowBack size={14} />}
            sx={pinkButtonSx}
          >
            На главную
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
