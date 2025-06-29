import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import {
  PasswordInput,
  Text,
  Stack,
  Center,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

import FormSection from '../components/ui/FormSection';
import ActionButton from '../components/ui/ActionButton';

interface Props {
  onBack: () => void;
}

export default function ResetPassword({ onBack }: Props) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (!token || !password) {
      showNotification({
        title: 'Ошибка',
        message: 'Токен и пароль обязательны',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setDone(true);
        showNotification({
          title: 'Готово',
          message: 'Пароль успешно обновлён',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else {
        const data = await res.json();
        showNotification({
          title: 'Ошибка',
          message: data.error || 'Не удалось сбросить пароль',
          color: 'red',
          icon: <IconAlertCircle size={18} />,
        });
      }
    } catch (err) {
      showNotification({
        title: 'Ошибка сети',
        message: 'Проверьте подключение',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <FormSection
        title="Новый пароль"
        description={!done ? 'Введите новый пароль и сохраните' : undefined}
      >
        {done ? (
          <>
            <Text mb="md" ta="center">
              Пароль успешно обновлён. Теперь войдите с новым паролем.
            </Text>
            <Center>
              <ActionButton variant="subtle" onClick={onBack}>
                Назад ко входу
              </ActionButton>
            </Center>
          </>
        ) : (
          <Stack>
            <PasswordInput
              label="Новый пароль"
              placeholder="Введите новый пароль"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <ActionButton onClick={handleSubmit} loading={loading}>
              Сохранить пароль
            </ActionButton>
            <ActionButton variant="subtle" onClick={onBack}>
              Назад ко входу
            </ActionButton>
          </Stack>
        )}
      </FormSection>
    </div>
  );
}
