import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Stack,
  Title,
  Text,
  Center,
  Loader,
} from '@mantine/core';
import ClientSchedule from './ClientSchedule';
import ClientNutrition from './ClientNutrition';

interface User {
  name: string;
  lastName?: string | null;
  email: string;
  age: number;
  role: 'USER' | 'ADMIN';
  id: string;
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      onLogout();
      return;
    }

    fetch(`${API}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
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
    <Container size="xs" py="xl">
      {section === 'main' && (
        <Stack spacing="sm">
          <Title order={2} mb="lg">
            Привет, {user.name} {user.lastName ?? ''} 👋
          </Title>

          <Button fullWidth color="blue" onClick={() => setSection('trainings')}>
            Мои тренировки
          </Button>

          <Button fullWidth color="blue" onClick={() => setSection('nutrition')}>
            Моё питание
          </Button>

          <Button fullWidth color="blue" disabled>
            Замеры (скоро)
          </Button>
          <Button fullWidth color="blue" disabled>
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
  );
}
