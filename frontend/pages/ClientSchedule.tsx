// frontend/pages/ClientSchedule.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Title,
  Text,
  Paper,
  Button,
  Stack,
  Group,
  Badge,
  Container,
} from '@mantine/core';
import { IconArrowBack, IconBox } from '@tabler/icons-react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { getToken } from '../utils/auth';

dayjs.extend(isSameOrBefore);

interface Training {
  id: string;
  date: string;
  hour: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
}

export default function ClientSchedule({
  onBack,
  onViewBlock,
}: {
  onBack: () => void;
  onViewBlock: () => void;
}) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  const loadTrainings = async () => {
    const res = await fetch(`${API}/api/trainings`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error('Ошибка загрузки тренировок:', res.status);
      return;
    }

    const data = await res.json();
    const sorted = data
      .filter((t: Training) => dayjs(t.date).isAfter(dayjs().subtract(1, 'day')))
      .sort((a, b) => {
        const d1 = dayjs(a.date).add(a.hour, 'hour');
        const d2 = dayjs(b.date).add(b.hour, 'hour');
        return d1.diff(d2);
      });

    setTrainings(sorted);
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
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
  };

  return (
    <Box sx={{ backgroundColor: '#e8b3a6', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Paper withBorder radius="lg" p="lg" shadow="md" sx={{ backgroundColor: '#fff' }}>
          <Title order={2} ta="center" mb="md">
            Мои тренировки
          </Title>

          {trainings.length === 0 ? (
            <>
              <Text size="sm" ta="center" color="dimmed" mb="md">
                У вас пока нет назначенных тренировок.
              </Text>
              <Button
                fullWidth
                leftIcon={<IconBox size={16} />}
                sx={pinkButtonSx}
                onClick={onViewBlock}
              >
                Блок тренировок
              </Button>
            </>
          ) : (
            <Stack spacing="sm">
              {trainings.map((t) => (
                <Paper key={t.id} withBorder p="md" radius="md" shadow="xs">
                  <Group position="apart" mb="xs">
                    <Text fw={600}>
                      {dayjs(t.date).format('DD.MM.YYYY')} в {t.hour}:00
                    </Text>
                    <Badge color={
                      t.status === 'CONFIRMED' ? 'green' :
                      t.status === 'DECLINED' ? 'red' : 'gray'
                    }>
                      {t.status === 'CONFIRMED' ? 'ПОДТВЕРЖДЕНО' :
                        t.status === 'DECLINED' ? 'ОТМЕНЕНО' : 'ОЖИДАНИЕ'}
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
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>

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
          color="pink"
          size="sm"
          onClick={onBack}
          leftIcon={<IconArrowBack size={14} />}
        >
          Назад
        </Button>
      </Box>
    </Box>
  );
}
