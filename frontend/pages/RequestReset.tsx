import { useState } from 'react';
import { Button, TextInput, Title, Container, Text, Stack } from '@mantine/core';

export default function RequestReset() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    await fetch('/api/reset-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  };

  return (
    <Container size="xs" mt="xl">
      <Title order={2} mb="md">Сброс пароля</Title>
      {sent ? (
        <Text>Если такой email существует, письмо с инструкцией отправлено.</Text>
      ) : (
        <Stack>
          <TextInput
            label="Email"
            placeholder="Введите ваш email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <Button onClick={handleSubmit}>Сбросить пароль</Button>
        </Stack>
      )}
    </Container>
  );
}
