import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Paper,
  Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useSearchParams } from 'react-router-dom';
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
    }
  }, [params, verifiedShown]);

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
    if (!email) return;

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
    <Paper shadow="md" p="xl" withBorder>
      <Stack>
        <Title order={3}>Вход</Title>

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
        <Button fullWidth onClick={handleLogin} loading={loading}>
          Войти
        </Button>

        {showResend && (
          <Button
            variant="light"
            color="blue"
            mt="sm"
            onClick={handleResend}
            loading={resending}
            leftIcon={<IconMail size={18} />}
          >
            Отправить письмо повторно
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
