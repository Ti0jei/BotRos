// frontend/pages/ClientSchedule.tsx
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
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { getToken } from '../utils/auth';
import ClientBlock from './ClientBlock';

dayjs.extend(isSameOrBefore);

interface Training {
  id: string;
  date: string;
  hour: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
}

export default function ClientSchedule({ onBack }: { onBack: () => void }) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBlock, setShowBlock] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  const loadTrainings = async () => {
    const res = await fetch(`${API}/api/trainings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();

    const sorted = data
      .filter((t: Training) => dayjs(t.date).isAfter(dayjs().subtract(1, 'day')))
      .sort((a, b) =>
        dayjs(a.date).add(a.hour, 'hour').diff(dayjs(b.date).add(b.hour, 'hour'))
      );
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

  if (showBlock) {
    return <ClientBlock userId="me" onBack={() => setShowBlock(false)} />;
  }

  return (
    <Box
      style={{
        backgroundColor: '#f5d4ca',
        minHeight: '100vh',
        paddingBottom: 80,
      }}
    >
      <Container size="xs" py="md">
        <Title order={2} ta="center" mb="md">
          Мои тренировки
        </Title>

        <Stack spacing="sm">
          {trainings.length === 0 ? (
            <Card withBorder radius="md" shadow="sm" p="md">
              <Text ta="center" mb="md">
                У вас пока нет назначенных тренировок.
              </Text>
              <Button
                variant="outline"
                color="pink"
                fullWidth
                leftIcon={<IconPackage size={16} />}
                onClick={() => setShowBlock(true)}
              >
                Блок тренировок
              </Button>
            </Card>
          ) : (
            trainings.map((t) => (
              <Card key={t.id} withBorder radius="md" p="md" shadow="xs">
                <Group position="apart" mb="xs">
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
              </Card>
            ))
          )}
        </Stack>

        <Group grow mt="lg">
          <Button
            variant="outline"
            color="pink"
            leftIcon={<IconPackage size={16} />}
            onClick={() => setShowBlock(true)}
          >
            Блок тренировок
          </Button>
          <Button
            variant="subtle"
            color="pink"
            onClick={onBack}
            leftIcon={<IconArrowBack size={14} />}
          >
            Назад
          </Button>
        </Group>
      </Container>
    </Box>
  );
}
