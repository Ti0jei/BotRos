import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Container, Title, PasswordInput, Button, Stack, Text } from '@mantine/core';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    await fetch('/api/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    setDone(true);
  };

  return (
    <Container size="xs" mt="xl">
      <Title order={2} mb="md">Новый пароль</Title>
      {done ? (
        <Text>Пароль успешно обновлён. Теперь войдите с новым паролем.</Text>
      ) : (
        <Stack>
          <PasswordInput
            label="Новый пароль"
            placeholder="Введите новый пароль"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Button onClick={handleSubmit}>Сохранить пароль</Button>
        </Stack>
      )}
    </Container>
  );
}
