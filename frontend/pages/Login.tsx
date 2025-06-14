import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useSearchParams } from 'react-router-dom';

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (params.get('verified') === 'true') {
      showNotification({
        title: 'Почта подтверждена',
        message: 'Теперь вы можете войти',
        color: 'green',
      });
    }
  }, [params]);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        onLoggedIn();
      } else {
        showNotification({
          title: 'Ошибка входа',
          message: data.error || 'Неверные данные',
          color: 'red',
        });
      }
    } catch (err) {
      console.error('Ошибка запроса:', err);
      showNotification({
        title: 'Сервер недоступен',
        message: 'Попробуйте позже',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="md" p="xl" withBorder>
      <Stack>
        <Title order={3}>Вход</Title>
        <TextInput
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button fullWidth onClick={handleLogin} loading={loading}>
          Войти
        </Button>
      </Stack>
    </Paper>
  );
}
