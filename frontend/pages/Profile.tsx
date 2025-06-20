import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Stack,
  Title,
  Text,
  Center,
  Loader,
  ActionIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import {
  IconBell,
  IconBellOff,
  IconRun,
  IconSoup,
  IconSettings,
  IconLogout,
} from '@tabler/icons-react';
import ClientSchedule from './ClientSchedule';
import ClientNutrition from './ClientNutrition';
import ClientBlock from './ClientBlock';

interface User {
  name: string;
  lastName?: string | null;
  email: string;
  age: number;
  role: 'USER' | 'ADMIN';
  id: string;
  notificationsMuted?: boolean;
}

export default function Profile({
  onLogout,
  onOpenAdmin,
}: {
  onLogout: () => void;
  onOpenAdmin: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<
    'main' | 'trainings' | 'nutrition' | 'measurements' | 'photos'
  >('main');
  const [showBlock, setShowBlock] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    if (!token) {
      onLogout();
      return;
    }

    fetch(`${API}/api/profile`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          fetch(`${API}/api/notifications`, { headers })
            .then((res) => res.json())
            .then((notif) => {
              if (notif?.muted !== undefined) {
                setUser((prev) =>
                  prev ? { ...prev, notificationsMuted: notif.muted } : prev
                );
              }
            });
        } else {
          throw new Error('Profile not found');
        }
      })
      .catch((err) => {
        console.error('Ошибка:', err);
        localStorage.removeItem('token');
        onLogout();
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  const toggleNotifications = async () => {
    if (!user) return;
    const newStatus = !user.notificationsMuted;

    try {
      await fetch(`${API}/api/notifications`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ muted: newStatus }),
      });
      setUser({ ...user, notificationsMuted: newStatus });
    } catch (err) {
      console.error('Ошибка обновления уведомлений:', err);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="100vh">
        <Text color="red">Не удалось загрузить профиль</Text>
      </Center>
    );
  }

  const pinkButtonSx = {
    backgroundColor: 'transparent',
    color: '#d6336c',
    fontWeight: 600,
    borderRadius: 12,
    border: 'none',
    fontSize: 17,
    height: 44,
    width: '100%',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
  };

  return (
    <Box
      style={{
        backgroundColor: '#e8b3a6',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <Container
        size="xs"
        style={{
          background: 'white',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: 420,
          position: 'relative',
        }}
      >
        {/* 🔔 Уведомление */}
        {section === 'main' && (
          <Tooltip label={user.notificationsMuted ? 'Оповещения выключены' : 'Оповещения включены'}>
            <ActionIcon
              variant="light"
              color={user.notificationsMuted ? 'gray' : 'pink'}
              onClick={toggleNotifications}
              radius="xl"
              size="lg"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
              }}
            >
              {user.notificationsMuted ? <IconBellOff size={20} /> : <IconBell size={20} />}
            </ActionIcon>
          </Tooltip>
        )}

        {/* 🏠 Главный экран */}
        {section === 'main' && (
          <Stack spacing="sm">
            <Title order={2} ta="center" mb="sm">
              Привет, {user.name} {user.lastName ?? ''} 👋
            </Title>

            <Button fullWidth onClick={() => setSection('trainings')} sx={pinkButtonSx}>
              Мои тренировки
            </Button>

            <Button fullWidth onClick={() => setSection('nutrition')} sx={pinkButtonSx}>
              Моё питание
            </Button>

            <Button fullWidth disabled sx={{ ...pinkButtonSx, color: '#999', backgroundColor: '#f5f5f5' }}>
              Замеры (скоро)
            </Button>

            <Button fullWidth disabled sx={{ ...pinkButtonSx, color: '#999', backgroundColor: '#f5f5f5' }}>
              Фото (скоро)
            </Button>

            <Button fullWidth disabled sx={{ ...pinkButtonSx, color: '#999', backgroundColor: '#f5f5f5' }}>
              Материалы для изучения
            </Button>

            {user.role === 'ADMIN' && (
              <Button fullWidth mt="sm" onClick={onOpenAdmin} sx={pinkButtonSx}>
                Панель тренера
              </Button>
            )}

            <Button
              fullWidth
              mt="md"
              variant="subtle"
              onClick={handleLogout}
              sx={pinkButtonSx}
              leftIcon={<IconLogout size={18} />}
            >
              Выйти
            </Button>
          </Stack>
        )}

        {/* 🗓️ Тренировки и блок */}
        {section === 'trainings' &&
          (showBlock ? (
            <ClientBlock onBack={() => setShowBlock(false)} />
          ) : (
            <ClientSchedule
              onBack={() => setSection('main')}
              onOpenBlock={() => setShowBlock(true)}
            />
          ))}

        {/* 🍲 Питание */}
        {section === 'nutrition' && (
          <ClientNutrition userId={user.id} onBack={() => setSection('main')} />
        )}
      </Container>
    </Box>
  );
}
