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

  const outlinePinkButtonStyle = {
    root: {
      border: '1.5px solid #d6336c',
      color: '#d6336c',
      backgroundColor: 'transparent',
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 15,
      height: 44,
      width: '100%',
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

  // Кнопка "Назад к профилю" из ClientNutrition
  const backButtonStyle = {
    root: {
      color: '#d6336c',
      border: '1px solid #d6336c',
      borderRadius: 8,
      fontWeight: 500,
      backgroundColor: 'transparent',
      width: '100%',
      padding: '10px 0',
      cursor: 'pointer',
      transition: 'background 0.2s',
      '&:hover': { backgroundColor: '#ffe3ed' },
    },
  };

  return (
    <>
      <Box
        style={{
          backgroundColor: '#f5d4ca',
          minHeight: '100vh',
          paddingTop: 0,
          paddingBottom: 60, // Чтобы контент не перекрывался кнопкой
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        <Box
          style={{
            backgroundColor: 'white',
            borderRadius: 0,
            padding: 24,
            width: '100%',
            maxWidth: 420,
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack spacing="lg" px="md" style={{ flexGrow: 1 }}>
            <Title order={2} ta="center" mb="md">
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
              <Text ta="center" c="dimmed" mt="md">
                У вас пока нет назначенных тренировок.
              </Text>
            ) : (
              trainings.map((t) => (
                <Box
                  key={t.id}
                  style={{
                    padding: 16,
                    width: '100%',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #f3bfcf',
                    borderRadius: 12,
                    marginTop: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
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
                        : t.status === 'DECLИНЕД'
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
                        fullWidth
                        styles={outlinePinkButtonStyle}
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

      {/* Фиксированная кнопка "Назад к профилю" */}
      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'white',
          padding: '10px 16px',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box style={{ maxWidth: 420, width: '100%' }}>
          <Button
            onClick={onBack}
            leftIcon={<IconArrowBack size={16} />}
            styles={backButtonStyle}
          >
            Назад к профилю
          </Button>
        </Box>
      </Box>
    </>
  );
}
