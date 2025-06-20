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
  Container,
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

  const pinkButtonSx = {
    backgroundColor: 'transparent',
    color: '#d6336c',
    fontWeight: 500,
    borderRadius: 8,
    transition: 'background-color 0.2s ease',
    border: '1.5px solid #d6336c',
    fontSize: 17,
    height: 44,
    width: '100%',
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
  };

  return (
    <>
      <Box style={{ backgroundColor: '#f5d4ca', minHeight: '100vh', paddingBottom: 90 }}>
        <Container size="xs" py="md">
          <Title order={2} ta="center" mb="lg">
            Мои тренировки
          </Title>

          <Button
            onClick={onOpenBlock}
            leftIcon={<IconPackage size={20} />}
            variant="outline"
            sx={{ ...pinkButtonSx, marginBottom: 24 }}
          >
            📦 Блок тренировок
          </Button>

          <Stack spacing="md">
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
                  style={{
                    background: 'white',
                    border: '1px solid #f3d3df',
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
        </Container>
      </Box>

      {/* 🔒 Фиксированная кнопка — строго вне основного контейнера */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          padding: '12px 16px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
          zIndex: 9999,
        }}
      >
        <Button
          fullWidth
          variant="subtle"
          onClick={onBack}
          sx={{
            backgroundColor: 'transparent',
            color: '#d6336c',
            fontWeight: 600,
            borderRadius: 8,
            fontSize: 18,
            border: 'none',
            height: 44,
            '&:hover': { backgroundColor: '#ffe3ed' },
          }}
          leftIcon={<span style={{ fontSize: 20, marginRight: 4 }}>←</span>}
        >
          На главную
        </Button>
      </Box>
    </>
  );
}
