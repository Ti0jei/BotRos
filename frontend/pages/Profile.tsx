import { useEffect, useState } from 'react';
import { Button, Container, Stack, Title, Text } from '@mantine/core';
import ClientSchedule from './ClientSchedule'; // используется для section === 'trainings'

interface User {
  name: string;
  email: string;
  age: number;
  role: 'USER' | 'ADMIN';
}

export default function Profile({
  onLogout,
  onOpenAdmin,
}: {
  onLogout: () => void;
  onOpenAdmin: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<'main' | 'trainings' | 'nutrition' | 'measurements' | 'photos'>('main');
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  if (!user) return null;

  return (
    <Container size="xs" py="xl">
      {section === 'main' && (
        <Stack spacing="sm">
          <Title order={2} mb="lg">Привет, {user.name} 👋</Title>

          <Button fullWidth color="blue" onClick={() => setSection('trainings')}>
            Мои тренировки
          </Button>

          <Button fullWidth color="blue" disabled>
            Питание (скоро)
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

      {section !== 'main' && section !== 'trainings' && (
        <Stack spacing="md">
          <Title order={3}>
            {{
              nutrition: 'Питание',
              measurements: 'Замеры',
              photos: 'Фото',
            }[section]}
          </Title>

          <Text size="sm" color="dimmed">[Раздел в разработке]</Text>

          <Button variant="light" onClick={() => setSection('main')}>
            ← Назад
          </Button>
        </Stack>
      )}
    </Container>
  );
}
