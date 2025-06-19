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
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  IconCheck,
  IconAlertCircle,
  IconMail,
} from '@tabler/icons-react';

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const [verifiedShown, setVerifiedShown] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('lastEmail');
    const savedPassword = sessionStorage.getItem('lastPassword');
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);

    if (!verifiedShown && params.get('verified') === 'true') {
      showNotification({
        title: 'Почта подтверждена',
        message: 'Теперь вы можете войти',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      setVerifiedShown(true);
      navigate(window.location.pathname); // убираем ?verified=true
    }
  }, [params, verifiedShown, navigate]);

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
      console.error('Ошибка запроса:', err);
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
      console.error('Ошибка повторной отправки:', err);
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

  return (
    <Box
      style={{
        backgroundImage: 'url("/images/krissfit-bg-pink.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <Paper
        shadow="xl"
        radius="md"
        p="xl"
        withBorder
        style={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          width: '100%',
          maxWidth: 400,
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
          <Button fullWidth onClick={handleLogin} loading={loading} mt="sm">
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
              color="gray"
              size="xs"
              onClick={() => navigate('?view=reset-request')}
            >
              Забыли пароль?
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
