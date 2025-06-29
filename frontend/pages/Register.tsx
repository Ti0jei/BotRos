import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Stack,
  Notification,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';

import ActionButton from '../components/ui/ActionButton';
import FormSection from '../components/ui/FormSection';

export default function Register({ onRegistered }: { onRegistered: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (window?.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      setTelegramId(window.Telegram.WebApp.initDataUnsafe.user.id.toString());
    }
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!inviteCode.trim()) {
      setError('Введите код приглашения');
      return;
    }

    const parsedAge = parseInt(age.trim(), 10);
    if (isNaN(parsedAge) || parsedAge <= 0) {
      setError('Укажите корректный возраст');
      return;
    }

    const body = {
      email,
      password,
      name,
      lastName,
      age: parsedAge,
      telegramId,
      inviteCode,
    };

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('lastEmail', email);
        sessionStorage.setItem('lastPassword', password);
        setSuccess(true);

        showNotification({
          title: 'Проверьте почту',
          message: data.message || 'На email отправлено письмо для подтверждения.',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else {
        setError(data?.error || 'Ошибка при регистрации');
      }
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError('Ошибка соединения с сервером');
    }
  };

  const handleGoToLogin = () => {
    sessionStorage.setItem('lastEmail', email);
    sessionStorage.setItem('lastPassword', password);
    onRegistered();
  };

  return (
    <div style={{ padding: 16 }}>
      <FormSection title="Регистрация" description="Заполните все поля, чтобы зарегистрироваться">
        <Stack>
          {error && (
            <Notification
              color="red"
              icon={<IconAlertCircle size={18} />}
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Notification>
          )}

          <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={success} />
          <PasswordInput label="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} disabled={success} />
          <TextInput label="Имя" value={name} onChange={(e) => setName(e.target.value)} disabled={success} />
          <TextInput label="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={success} />
          <TextInput label="Возраст" value={age} onChange={(e) => setAge(e.target.value)} disabled={success} />
          <TextInput label="Инвайт-код" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} disabled={success} />

          {!success ? (
            <ActionButton onClick={handleSubmit}>Зарегистрироваться</ActionButton>
          ) : (
            <ActionButton color="blue" onClick={handleGoToLogin}>
              Перейти ко входу
            </ActionButton>
          )}
        </Stack>
      </FormSection>
    </div>
  );
}
