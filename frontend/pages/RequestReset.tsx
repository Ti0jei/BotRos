import { useState } from 'react';
import {
  Button,
  TextInput,
  Title,
  Container,
  Text,
  Stack,
  Center,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';

interface Props {
  onBack: () => void;
}

export default function RequestReset({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const err = await res.json();
        showNotification({
          title: 'Ошибка',
          message: err.error || 'Не удалось отправить письмо',
          color: 'red',
        });
      }
    } catch (err) {
      showNotification({
        title: 'Ошибка сети',
        message: 'Проверьте соединение',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" mt="xl">
      <Title order={2} mb="md">Сброс пароля</Title>

      {sent ? (
        <Text>
          Если такой email существует, письмо с инструкцией отправлено. Проверьте почту.
        </Text>
      ) : (
        <Stack>
          <TextInput
            label="Email"
            placeholder="Введите ваш email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <Button onClick={handleSubmit} disabled={!email || loading} loading={loading}>
            Сбросить пароль
          </Button>
        </Stack>
      )}

      {!sent && (
        <Center mt="md">
          <Button variant="subtle" onClick={onBack}>
            Назад ко входу
          </Button>
        </Center>
      )}
    </Container>
  );
}
