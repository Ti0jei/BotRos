import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
} from '@mantine/core';

export default function Register({ onRegistered }: { onRegistered: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [telegramId, setTelegramId] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (window?.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      setTelegramId(window.Telegram.WebApp.initDataUnsafe.user.id.toString());
    }
  }, []);

  const handleSubmit = async () => {
    const body = {
      email,
      password,
      name,
      lastName,
      age: Number(age),
      telegramId,
    };

    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      onRegistered();
    }
  };

  return (
    <Paper shadow="md" p="xl" withBorder>
      <Stack>
        <Title order={3}>Регистрация</Title>
        <TextInput label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <PasswordInput label="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        <TextInput label="Имя" value={name} onChange={e => setName(e.target.value)} />
        <TextInput label="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} />
        <TextInput label="Возраст" value={age} onChange={e => setAge(e.target.value)} />
        <Button fullWidth onClick={handleSubmit}>Зарегистрироваться</Button>
      </Stack>
    </Paper>
  );
}
