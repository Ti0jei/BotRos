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
import { IconPackage } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { getToken } from '../utils/auth';
import BackButtonFixed from '../components/BackButtonFixed'; // Импорт фиксированной кнопки

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
    // eslint-disable-next-line
  }, []);

  // Универсальный стиль розовой кнопки
  const pinkButtonStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#d6336c',
    fontWeight: 600,
    border: '1.5px solid #d6336c',
    borderRadius: 12,
    height: 44,
    width: '100%',
    fontSize: 17,
    transition: 'background 0.15s',
    boxShadow: 'none',
    cursor: 'pointer',
    margin: 0,
  };

  return (
    <>
      <Box
        style={{
          backgroundColor: '#f5d4ca',
          minHeight: '100vh',
          paddingBottom: 90, // Чтобы фиксированная кнопка не перекрывала контент
          position: 'relative',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            margin: '0 auto',
            background: 'rgba(255,255,255,0.94)',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            padding: '32px 20px 32px 20px',
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 36,
          }}
        >
          <Title order={2} ta="center" mb={20}>
            Мои тренировки
          </Title>

          <button
            onClick={onOpenBlock}
            style={{
              ...pinkButtonStyle,
              marginBottom: 24,
              maxWidth: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseOver={e =>
              (e.currentTarget.style.background = '#ffe3ed')
            }
            onMouseOut={e =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            <IconPackage size={20} style={{ marginRight: 6 }} />
            <span>Блок тренировок</span>
          </button>

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
      {/* Новый компонент фиксированной кнопки */}
      <BackButtonFixed onClick={onBack}>На главную</BackButtonFixed>
    </>
  );
}
