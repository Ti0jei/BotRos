import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  Card,
} from '@mantine/core';
import { IconPackage, IconArrowBack } from '@tabler/icons-react';
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

  return (
    <Box className="bg-[#f5d4ca] min-h-screen flex justify-center">
      <Box className="bg-white w-full max-w-[380px] p-6 pb-28 shadow-md flex flex-col">
        <Stack spacing="lg" className="flex-grow">
          <Title order={2} ta="center" className="font-bold text-xl">
            Мои тренировки
          </Title>

          <Button
            onClick={onOpenBlock}
            leftIcon={<IconPackage size={20} />}
            variant="outline"
            color="pink"
            radius="xl"
            fullWidth
          >
            📦 Блок тренировок
          </Button>

          {trainings.length === 0 ? (
            <Text ta="center" c="dimmed" mt="md">
              У вас пока нет назначенных тренировок.
            </Text>
          ) : (
            trainings.map((t) => (
              <Card
                key={t.id}
                padding="md"
                radius="lg"
                withBorder
                shadow="xs"
                className="mt-3"
              >
                <Group position="apart" mb="xs">
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
                      variant="light"
                      color="green"
                      radius="md"
                    >
                      ✅ Приду
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => updateStatus(t.id, 'DECLINED')}
                      variant="light"
                      color="red"
                      radius="md"
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
                      fullWidth
                      variant="outline"
                      color="pink"
                      radius="xl"
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

        <Box className="fixed bottom-0 left-0 w-full bg-white p-4 shadow z-50">
          <Box className="max-w-[420px] mx-auto">
            <Button
              onClick={onBack}
              leftIcon={<IconArrowBack size={14} />}
              variant="outline"
              color="pink"
              radius="xl"
              fullWidth
            >
              Назад к профилю
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
