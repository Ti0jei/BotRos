import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Text,
  Title,
  Badge,
  Group,
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

  useEffect(() => {
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
        .sort((a, b) =>
          dayjs(a.date).add(a.hour, 'hour').diff(dayjs(b.date).add(b.hour, 'hour'))
        );
      setTrainings(upcoming);
    };
    loadTrainings();
  }, []);

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
    const res = await fetch(`${API}/api/trainings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await res.json();
    setTrainings(updated);
  };

  return (
    <Box style={{ background: '#f5d4ca', minHeight: '100vh', paddingBottom: 100 }}>
      <Box style={{ maxWidth: 420, margin: '0 auto', padding: 16 }}>
        <Stack spacing="md">
          <Title order={2} align="center">
            Мои тренировки
          </Title>

          <Button
            onClick={onOpenBlock}
            leftIcon={<IconPackage size={20} />}
            variant="outline"
            color="pink"
            radius="md"
            fullWidth
          >
            📦 Блок тренировок
          </Button>

          {trainings.length === 0 ? (
            <Text align="center" color="dimmed">
              У вас пока нет назначенных тренировок.
            </Text>
          ) : (
            trainings.map((t) => (
              <Box
                key={t.id}
                style={{
                  background: '#ffd7cf',
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                }}
              >
                <Group position="apart" mb="xs">
                  <Text weight={600}>{dayjs(t.date).format('DD.MM.YYYY')} в {t.hour}:00</Text>
                  <Badge color={
                    t.status === 'CONFIRMED' ? 'green' :
                    t.status === 'DECLINED' ? 'red' : 'gray'
                  } variant="light">
                    {t.status === 'CONFIRMED' ? 'ПОДТВЕРЖДЕНО' :
                     t.status === 'DECLINED' ? 'ОТМЕНЕНО' : 'ОЖИДАНИЕ'}
                  </Badge>
                </Group>

                {t.status === 'PENDING' || editingId === t.id ? (
                  <Stack spacing="xs">
                    <Button
                      color="green"
                      variant="light"
                      fullWidth
                      onClick={() => updateStatus(t.id, 'CONFIRMED')}
                    >
                      ✅ Приду
                    </Button>
                    <Button
                      color="red"
                      variant="light"
                      fullWidth
                      onClick={() => updateStatus(t.id, 'DECLINED')}
                    >
                      ❌ Не приду
                    </Button>
                  </Stack>
                ) : (
                  <>
                    <Text mt="xs" size="sm" color="dimmed">
                      {t.status === 'CONFIRMED' ? '✅ Вы подтвердили участие' : '🚫 Вы отказались от тренировки'}
                    </Text>
                    <Button
                      mt="xs"
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

          <Button
            onClick={onBack}
            variant="outline"
            color="pink"
            radius="md"
            fullWidth
          >
            ← Назад к профилю
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
