import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
  Group,
  Box,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconAlertCircle, IconMail } from '@tabler/icons-react';

export default function Login({
  onLoggedIn,
  onResetRequest,
}: {
  onLoggedIn: () => void;
  onResetRequest: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('lastEmail');
    const savedPassword = sessionStorage.getItem('lastPassword');
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setShowResend(false);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        sessionStorage.removeItem('lastEmail');
        sessionStorage.removeItem('lastPassword');
        onLoggedIn();
      } else {
        const errorMsg = data.error || 'Неверные данные';

        showNotification({
          title: 'Ошибка входа',
          message:
            errorMsg === 'Подтвердите email перед входом'
              ? 'Пожалуйста, подтвердите почту по ссылке в письме'
              : errorMsg,
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });

        if (errorMsg === 'Подтвердите email перед входом') {
          setShowResend(true);
        }
      }
    } catch (err) {
      showNotification({
        title: 'Сервер недоступен',
        message: 'Попробуйте позже',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showNotification({
        title: 'Email не указан',
        message: 'Введите email, чтобы отправить письмо повторно',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    setResending(true);

    try {
      const res = await fetch(`${API}/api/auth/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification({
          title: 'Письмо отправлено',
          message: 'Проверьте почту и подтвердите email',
          color: 'green',
          icon: <IconMail size={18} />,
        });
      } else {
        showNotification({
          title: 'Ошибка',
          message: data?.error || 'Не удалось отправить письмо',
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });
      }
    } catch (err) {
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось отправить письмо',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setResending(false);
    }
  };

  const subtleButtonSx = {
    backgroundColor: 'transparent',
    color: '#d6336c',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
  };

  return (
    <Box
      style={{
        backgroundColor: '#e8b3a6',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        shadow="md"
        radius="lg"
        p="xl"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 0 12px rgba(0,0,0,0.1)',
        }}
      >
        <Stack>
          <Title order={2} align="center" fw={700} mb="sm">
            Вход в Krissfit
          </Title>

          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <PasswordInput
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button fullWidth onClick={handleLogin} loading={loading} mt="sm" color="pink">
            Войти
          </Button>

          {showResend && (
            <Button
              variant="light"
              color="pink"
              mt="sm"
              onClick={handleResend}
              loading={resending}
              leftIcon={<IconMail size={18} />}
            >
              Отправить письмо повторно
            </Button>
          )}

          <Group position="center" mt="xs">
            <Button
              variant="subtle"
              sx={subtleButtonSx}
              size="xs"
              onClick={onResetRequest}
            >
              Забыли пароль?
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
