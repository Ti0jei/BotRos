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

interface Props {
  onBack: () => void;
}

export default function ResetPassword({ onBack }: Props) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) {
      showNotification({
        title: 'Ошибка',
        message: 'Пароль не может быть пустым',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json();
        showNotification({
          title: 'Ошибка',
          message: data.error || 'Не удалось сбросить пароль',
          color: 'red',
        });
      }
    } catch (err) {
      showNotification({
        title: 'Ошибка сети',
        message: 'Проверьте подключение',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" mt="xl">
      <Title order={2} mb="md">
        Новый пароль
      </Title>

      {done ? (
        <>
          <Text mb="md">Пароль успешно обновлён. Теперь войдите с новым паролем.</Text>
          <Center>
            <Button onClick={onBack}>Назад ко входу</Button>
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
          <Button onClick={handleSubmit} loading={loading}>
            Сохранить пароль
          </Button>
          <Button variant="subtle" onClick={onBack} color="gray">
            Назад ко входу
          </Button>
        </Stack>
      )}
    </Container>
  );
}
