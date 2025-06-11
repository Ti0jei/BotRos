import { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Paper, Title } from '@mantine/core';

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const API = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async () => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      onLoggedIn();
    }
  };

  return (
    <Paper shadow="md" p="xl" withBorder>
      <Stack>
        <Title order={3}>Вход</Title>
        <TextInput label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <PasswordInput label="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        <Button fullWidth onClick={handleLogin}>Войти</Button>
      </Stack>
    </Paper>
  );
}
