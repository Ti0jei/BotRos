// frontend/pages/Profile.tsx
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
    fontWeight: 500,
    borderRadius: 8,
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
  };

  return (
    <div
      style={{
        backgroundColor: '#e8b3a6',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Container
        size="xs"
        p={24}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 24,
          boxShadow: '0 0 12px rgba(0,0,0,0.1)',
          position: 'relative',
          width: '100%',
          maxWidth: 420,
        }}
      >
        {section === 'main' && (
          <Tooltip
            label={user.notificationsMuted ? 'Оповещения выключены' : 'Оповещения включены'}
          >
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

        {section === 'main' && (
          <Stack spacing="sm">
            <Title order={2} ta="center" mb="sm">
              Привет, {user.name} {user.lastName ?? ''} 👋
            </Title>

            <Button
              fullWidth
              radius="md"
              variant="light"
              color="pink"
              leftIcon={<IconRun size={18} />}
              onClick={() => setSection('trainings')}
            >
              Мои тренировки
            </Button>

            <Button
              fullWidth
              radius="md"
              variant="light"
              color="pink"
              leftIcon={<IconSoup size={18} />}
              onClick={() => setSection('nutrition')}
            >
              Моё питание
            </Button>

            <Button
              fullWidth
              radius="md"
              disabled
              leftIcon={<IconRun size={18} />}
              styles={{ root: { backgroundColor: '#f5f5f5', color: '#999' } }}
            >
              Замеры (скоро)
            </Button>

            <Button
              fullWidth
              radius="md"
              disabled
              leftIcon={<IconRun size={18} />}
              styles={{ root: { backgroundColor: '#f5f5f5', color: '#999' } }}
            >
              Фото (скоро)
            </Button>

            <Button
              fullWidth
              radius="md"
              disabled
              leftIcon={<IconSettings size={18} />}
              variant="light"
              styles={{ root: { backgroundColor: '#f5f5f5', color: '#999' } }}
            >
              Материалы для изучения
            </Button>

            {user.role === 'ADMIN' && (
              <Button
                fullWidth
                radius="md"
                variant="light"
                color="pink"
                mt="sm"
                leftIcon={<IconSettings size={18} />}
                onClick={onOpenAdmin}
              >
                Панель тренера
              </Button>
            )}

            <Button
              fullWidth
              mt="md"
              radius="md"
              leftIcon={<IconLogout size={18} />}
              variant="subtle"
              sx={pinkButtonSx}
              onClick={handleLogout}
            >
              Выйти
            </Button>
          </Stack>
        )}

        {section === 'trainings' && (
          <ClientSchedule onBack={() => setSection('main')} />
        )}

        {section === 'nutrition' && (
          <ClientNutrition userId={user.id} onBack={() => setSection('main')} />
        )}

        {['measurements', 'photos'].includes(section) && (
          <Stack spacing="md">
            <Title order={3}>
              {section === 'measurements' ? 'Замеры' : 'Фото'}
            </Title>
            <Text size="sm" color="dimmed">
              [Раздел в разработке]
            </Text>
            <Button variant="light" onClick={() => setSection('main')}>
              ← Назад
            </Button>
          </Stack>
        )}
      </Container>
    </div>
  );
}
