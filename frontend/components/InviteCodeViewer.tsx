// components/InviteCodeViewer.tsx
import { useEffect, useState } from 'react';
import {
  Text,
  Card,
  Group,
  Loader,
  CopyButton,
  Tooltip,
  Button,
  Stack,
} from '@mantine/core';
import {
  IconRefresh,
  IconCheck,
  IconCopy,
} from '@tabler/icons-react';

const API = import.meta.env.VITE_API_BASE_URL;

export default function InviteCodeViewer() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [expires, setExpires] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInviteCode = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const query = force ? '?admin=true&force=true' : '?admin=true';
      const res = await fetch(`${API}/api/invite-code${query}`);
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

  const outlineButtonStyle = {
    root: {
      border: '1px solid #1a1a1a',
      color: '#1a1a1a',
      backgroundColor: 'white',
      fontWeight: 500,
      '&:hover': {
        backgroundColor: '#f0f0f0',
      },
    },
  };

  return (
    <Card withBorder shadow="xs" radius="md" p="md">
      <Stack spacing="sm">
        <Group position="apart">
          <Text fw={600} size="sm" c="#222">
            Код для регистрации
          </Text>
          <Button
            size="xs"
            variant="outline"
            leftIcon={<IconRefresh size={14} />}
            onClick={() => fetchInviteCode(true)}
            styles={outlineButtonStyle}
          >
            Обновить
          </Button>
        </Group>

        {loading && <Loader size="sm" />}
        {error && <Text color="red">{error}</Text>}

        {code && (
          <Group position="apart" noWrap>
            <Group spacing="xs" align="center">
              <Text size="xl" fw={700}>
                {code}
              </Text>
              <CopyButton value={code}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Скопировано' : 'Скопировать'}>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={copy}
                      styles={outlineButtonStyle}
                    >
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </Button>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            {expires && (
              <Text size="xs" color="dimmed">
                До {new Date(expires).toLocaleTimeString()}
              </Text>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}
