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

  return (
    <div
      style={{
        backgroundImage: 'url(/images/client-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <Container
        size="xs"
        p="xl"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: 16,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          position: 'relative',
        }}
      >
        {/* 🔔 Кнопка оповещений */}
        {section === 'main' && (
          <Tooltip
            label={
              user.notificationsMuted
                ? 'Оповещения выключены'
                : 'Оповещения включены'
            }
          >
            <ActionIcon
              variant="light"
              color={user.notificationsMuted ? 'gray' : 'blue'}
              onClick={toggleNotifications}
              radius="xl"
              size="lg"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
              }}
            >
              {user.notificationsMuted ? (
                <IconBellOff size={20} />
              ) : (
                <IconBell size={20} />
              )}
            </ActionIcon>
          </Tooltip>
        )}

        {/* Главный экран */}
        {section === 'main' && (
          <Stack spacing="sm">
            <Title order={2} mb="lg" ta="center">
              Привет, {user.name} {user.lastName ?? ''} 👋
            </Title>

            <Button fullWidth color="blue" onClick={() => setSection('trainings')}>
              Мои тренировки
            </Button>

            <Button fullWidth color="blue" onClick={() => setSection('nutrition')}>
              Моё питание
            </Button>

            <Button fullWidth color="gray" disabled>
              Замеры (скоро)
            </Button>
            <Button fullWidth color="gray" disabled>
              Фото (скоро)
            </Button>
            <Button fullWidth variant="light" color="gray" disabled>
              Материал для изучения
            </Button>

            {user.role === 'ADMIN' && (
              <Button fullWidth mt="sm" onClick={onOpenAdmin}>
                Панель тренера
              </Button>
            )}

            <Button fullWidth color="red" mt="lg" onClick={handleLogout}>
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
