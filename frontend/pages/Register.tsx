import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
  Notification,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';

export default function Register({ onRegistered }: { onRegistered: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (window?.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      setTelegramId(window.Telegram.WebApp.initDataUnsafe.user.id.toString());
    }
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!inviteCode.trim()) {
      setError('Введите код приглашения');
      return;
    }

    const body = {
      email,
      password,
      name,
      lastName,
      age: Number(age),
      telegramId,
      inviteCode,
    };

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification({
          title: 'Регистрация прошла успешно',
          message: data.message || 'Проверьте почту и подтвердите email',
          color: 'green',
          icon: <IconCheck size={18} />,
        });

        onRegistered(); // можешь оставить или убрать
      } else {
        setError(data?.error || 'Ошибка при регистрации');
      }
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <Paper shadow="md" p="xl" withBorder>
      <Stack>
        <Title order={3}>Регистрация</Title>

        {error && (
          <Notification
            color="red"
            icon={<IconAlertCircle size={18} />}
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Notification>
        )}

        <TextInput
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <PasswordInput
          label="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <TextInput
          label="Имя"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <TextInput
          label="Фамилия"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />

        <TextInput
          label="Возраст"
          value={age}
          onChange={e => setAge(e.target.value)}
        />

        <TextInput
          label="Инвайт-код"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
        />

        <Button fullWidth onClick={handleSubmit}>
          Зарегистрироваться
        </Button>
      </Stack>
    </Paper>
  );
}
