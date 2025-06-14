import { useEffect, useState } from 'react';
import {
  Button,
  Text,
  Paper,
  Group,
  Loader,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { IconRefresh, IconCheck, IconCopy } from '@tabler/icons-react';

const API = import.meta.env.VITE_API_BASE_URL;

export default function InviteCodeViewer() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [expires, setExpires] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInviteCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/invite-code?admin=true`);
      const data = await res.json();

      if (res.ok) {
        setCode(data.code);
        setExpires(data.expiresAt);
      } else {
        setError(data.error || 'Ошибка загрузки кода');
      }
    } catch (err) {
      setError('Сервер недоступен');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInviteCode();
  }, []);

  return (
    <Paper withBorder p="md" shadow="xs" mt="md">
      <Group position="apart" mb="xs">
        <Text weight={500}>Код для регистрации</Text>
        <Button
          variant="light"
          size="xs"
          onClick={fetchInviteCode}
          leftIcon={<IconRefresh size={14} />}
        >
          Обновить
        </Button>
      </Group>

      {loading && <Loader size="sm" />}
      {error && <Text color="red">{error}</Text>}

      {code && (
        <Group position="apart">
          <Group spacing="xs">
            <Text size="xl" weight={700}>{code}</Text>
            <CopyButton value={code}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Скопировано' : 'Скопировать'}>
                  <Button size="xs" variant="default" onClick={copy}>
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </Button>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          {expires && (
            <Text size="xs" color="dimmed">
              Действует до: {new Date(expires).toLocaleTimeString()}
            </Text>
          )}
        </Group>
      )}
    </Paper>
  );
}
