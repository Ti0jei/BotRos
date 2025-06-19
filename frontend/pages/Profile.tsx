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
import { IconBell, IconBellOff } from '@tabler/icons-react';
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

  // кастомные стили кнопок
  const primaryStyle = {
    backgroundColor: '#d47291',
    color: 'white',
    '&:hover': {
      backgroundColor: '#c15f7e',
    },
  };

  const secondaryStyle = {
    backgroundColor: '#f0f0f0',
    color: '#555',
  };

  return (
    <div
      style={{
        backgroundImage: 'url(/images/client-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Container
        size="xs"
        p={32}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: 24,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          position: 'relative',
          width: '100%',
          maxWidth: 420,
        }}
      >
        {/* 🔕 Иконка оповещений */}
        {section === 'main' && (
          <Tooltip
            label={user.notificationsMuted ? 'Оповещения выключены' : 'Оповещения включены'}
          >
            <ActionIcon
              variant="light"
              color={user.notificationsMuted ? 'gray' : 'blue'}
              onClick={toggleNotifications}
              radius="xl"
              size="lg"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                opacity: 0.7,
              }}
            >
              {user.notificationsMuted ? <IconBellOff size={20} /> : <IconBell size={20} />}
            </ActionIcon>
          </Tooltip>
        )}

        {/* Главная секция */}
        {section === 'main' && (
          <Stack spacing="sm">
            <Title order={2} ta="center" mb="sm">
              Привет, {user.name} {user.lastName ?? ''} 👋
            </Title>

            <Button fullWidth radius="md" styles={{ root: primaryStyle }} onClick={() => setSection('trainings')}>
              Мои тренировки
            </Button>

            <Button fullWidth radius="md" styles={{ root: primaryStyle }} onClick={() => setSection('nutrition')}>
              Моё питание
            </Button>

            <Button fullWidth radius="md" disabled styles={{ root: secondaryStyle }}>
              Замеры (скоро)
            </Button>

            <Button fullWidth radius="md" disabled styles={{ root: secondaryStyle }}>
              Фото (скоро)
            </Button>

            <Button fullWidth radius="md" variant="light" disabled styles={{ root: secondaryStyle }}>
              Материал для изучения
            </Button>

            {user.role === 'ADMIN' && (
              <Button fullWidth mt="sm" radius="md" styles={{ root: primaryStyle }} onClick={onOpenAdmin}>
                Панель тренера
              </Button>
            )}

            <Button fullWidth color="red" mt="md" radius="md" onClick={handleLogout}>
              Выйти
            </Button>
          </Stack>
        )}

        {/* Подстраницы */}
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
