import { useState } from 'react';
import {
  TextInput,
  Text,
  Stack,
  Center,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconMail } from '@tabler/icons-react';

import ActionButton from '../components/ui/ActionButton';
import FormSection from '../components/ui/FormSection';

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
    <div style={{ padding: 16 }}>
      <FormSection
        title="Сброс пароля"
        description={sent ? undefined : 'Введите email, на который придёт письмо'}
      >
        {sent ? (
          <>
            <Text mb="md" ta="center">
              Если такой email существует, письмо с инструкцией отправлено. Проверьте почту.
            </Text>
            <Center>
              <ActionButton variant="subtle" onClick={onBack}>
                На главную
              </ActionButton>
            </Center>
          </>
        ) : (
          <Stack>
            <TextInput
              label="Email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <ActionButton
              onClick={handleSubmit}
              loading={loading}
              disabled={!email}
              leftIcon={<IconMail size={16} />}
            >
              Сбросить пароль
            </ActionButton>
            <Center>
              <ActionButton variant="subtle" onClick={onBack}>
                На главную
              </ActionButton>
            </Center>
          </Stack>
        )}
      </FormSection>
    </div>
  );
}
