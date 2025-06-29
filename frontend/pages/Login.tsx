import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Stack,
  Group,
  Loader,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

import FormSection from '../components/ui/FormSection';
import ActionButton from '../components/ui/ActionButton';

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
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.reason === 'email_not_verified') {
          setShowResend(true);
        }

        showNotification({
          title: 'Ошибка входа',
          message: data.message || 'Неверные данные',
          color: 'red',
          icon: <IconAlertCircle />,
        });
      } else {
        sessionStorage.setItem('lastEmail', email);
        sessionStorage.setItem('lastPassword', password);
        onLoggedIn();
      }
    } catch (err) {
      showNotification({
        title: 'Ошибка',
        message: 'Сервер недоступен',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    }
    setLoading(false);
  };

  const handleResend = async () => {
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
          message: 'Проверьте почту для подтверждения',
          color: 'green',
          icon: <IconCheck />,
        });
      } else {
        showNotification({
          title: 'Ошибка',
          message: data.message || 'Не удалось отправить',
          color: 'red',
          icon: <IconAlertCircle />,
        });
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <FormSection title="Вход в Krissfit" description="Введите почту и пароль">
        <Stack spacing="sm">
          <TextInput
            label="Email"
            placeholder="you@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />

          <ActionButton onClick={handleLogin} disabled={loading}>
            {loading ? <Loader size="xs" color="white" /> : 'Войти'}
          </ActionButton>

          {showResend && (
            <ActionButton onClick={handleResend} variant="outline" disabled={resending}>
              {resending ? <Loader size="xs" /> : 'Отправить письмо повторно'}
            </ActionButton>
          )}

          <Group position="right">
            <ActionButton
              variant="subtle"
              onClick={onResetRequest}
              style={{ padding: 0 }}
            >
              Забыли пароль?
            </ActionButton>
          </Group>
        </Stack>
      </FormSection>
    </div>
  );
}
