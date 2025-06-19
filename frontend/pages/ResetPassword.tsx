import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import {
  Container,
  Title,
  PasswordInput,
  Button,
  Stack,
  Text,
  Center,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

interface Props {
  onBack: () => void;
}

export default function ResetPassword({ onBack }: Props) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (!token || !password) {
      showNotification({
        title: 'Ошибка',
        message: 'Токен и пароль обязательны',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setDone(true);
        showNotification({
          title: 'Готово',
          message: 'Пароль успешно обновлён',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else {
        const data = await res.json();
        showNotification({
          title: 'Ошибка',
          message: data.error || 'Не удалось сбросить пароль',
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });
      }
    } catch (err) {
      showNotification({
        title: 'Ошибка сети',
        message: 'Проверьте подключение',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url(/images/reset-bg.jpg)',
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
        p="xl"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: 16,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        <Title order={2} mb="md" ta="center">
          Новый пароль
        </Title>

        {done ? (
          <>
            <Text mb="md" ta="center">
              Пароль успешно обновлён. Теперь войдите с новым паролем.
            </Text>
            <Center>
              <Button color="pink" onClick={onBack}>
                Назад ко входу
              </Button>
            </Center>
          </>
        ) : (
          <Stack>
            <PasswordInput
              label="Новый пароль"
              placeholder="Введите новый пароль"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button onClick={handleSubmit} loading={loading} color="pink">
              Сохранить пароль
            </Button>
            <Button variant="subtle" onClick={onBack} color="gray">
              Назад ко входу
            </Button>
          </Stack>
        )}
      </Container>
    </div>
  );
}
