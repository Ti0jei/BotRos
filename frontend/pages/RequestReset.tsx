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
import { IconMail } from '@tabler/icons-react';

interface Props {
  onBack: () => void;
}

export default function RequestReset({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (!email) {
      showNotification({
        title: 'Email не указан',
        message: 'Введите email для сброса пароля',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        showNotification({
          title: 'Письмо отправлено',
          message: 'Если email существует, инструкция отправлена',
          color: 'green',
        });
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
        message: 'Проверьте подключение к интернету',
        color: 'red',
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
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Title order={2} mb="md" ta="center">Сброс пароля</Title>

        {sent ? (
          <>
            <Text mb="md" ta="center">
              Если такой email существует, письмо с инструкцией отправлено. Проверьте почту.
            </Text>
            <Center>
              <Button variant="subtle" onClick={onBack} color="pink">
                На главную
              </Button>
            </Center>
          </>
        ) : (
          <>
            <Stack>
              <TextInput
                label="Email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!email}
                leftIcon={<IconMail size={16} />}
              >
                Сбросить пароль
              </Button>
            </Stack>

            <Center mt="md">
              <Button variant="subtle" onClick={onBack} color="pink">
                На главную
              </Button>
            </Center>
          </>
        )}
      </Container>
    </div>
  );
}
