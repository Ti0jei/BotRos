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
import { IconBell, IconBellOff, IconLogout } from '@tabler/icons-react';
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
  const [section, setSection] = useState<'main' | 'trainings' | 'nutrition' | 'measurements' | 'photos'>('main');
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

  // Унифицированный стиль кнопок
  const buttonStyle = {
    root: {
      border: '1.5px solid #d6336c',
      color: '#d6336c',
      backgroundColor: 'transparent',
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 15,
      height: 44,
      transition: 'background 0.2s, color 0.2s',
      '&:hover': {
        backgroundColor: '#ffe3ed',
        color: '#b3244a',
      },
    },
  };

  const disabledButtonStyle = {
    root: {
      color: '#999',
      backgroundColor: '#eceff1',
      borderRadius: 12,
      fontWeight: 500,
      height: 44,
      cursor: 'not-allowed',
      border: '1.5px solid #ccc',
    },
  };

  return (
    <Box
      style={{
        backgroundColor: '#f5d4ca',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 16,
        paddingBottom: 80,
      }}
    >
      <Container
        size="xs"
        style={{
          background: 'white',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: 400,
          position: 'relative',
        }}
      >
        {/* Уведомления */}
        {section === 'main' && (
          <Tooltip label={user.notificationsMuted ? 'Оповещения выключены' : 'Оповещения включены'}>
            <ActionIcon
              variant="filled"
              color={user.notificationsMuted ? 'gray' : 'pink'}
              onClick={toggleNotifications}
              radius="xl"
              size="lg"
              style={{ position: 'absolute', top: 16, right: 16 }}
            >
              {user.notificationsMuted ? <IconBellOff size={20} /> : <IconBell size={20} />}
            </ActionIcon>
          </Tooltip>
        )}

        {/* Главный экран */}
        {section === 'main' && (
          <Stack spacing="sm">
            <Title order={2} ta="center" mb="sm" style={{ fontWeight: 800 }}>
              Привет, {user.name} 👋
            </Title>

            <Button fullWidth styles={buttonStyle} onClick={() => setSection('trainings')}>
              Мои тренировки
            </Button>

            <Button fullWidth styles={buttonStyle} onClick={() => setSection('nutrition')}>
              Моё питание
            </Button>

            <Button fullWidth styles={disabledButtonStyle} disabled>
              Замеры (скоро)
            </Button>

            <Button fullWidth styles={disabledButtonStyle} disabled>
              Фото (скоро)
            </Button>

            <Button fullWidth styles={disabledButtonStyle} disabled>
              Материалы (скоро)
            </Button>

            {user.role === 'ADMIN' && (
              <Button fullWidth mt="sm" styles={buttonStyle} onClick={onOpenAdmin}>
                Панель тренера
              </Button>
            )}

            <Button
              mt="md"
              onClick={handleLogout}
              leftIcon={<IconLogout size={18} />}
              fullWidth
              styles={buttonStyle}
            >
              Выйти
            </Button>
          </Stack>
        )}

        {/* Тренировки / расписание */}
        {section === 'trainings' &&
          (showBlock ? (
            <ClientBlock onBack={() => setShowBlock(false)} />
          ) : (
            <ClientSchedule
              onBack={() => setSection('main')}
              onOpenBlock={() => setShowBlock(true)}
            />
          ))}

        {/* Питание */}
        {section === 'nutrition' && (
          <ClientNutrition userId={user.id} onBack={() => setSection('main')} />
        )}
      </Container>
    </Box>
  );
}
