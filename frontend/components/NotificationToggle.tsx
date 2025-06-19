import { useEffect, useState } from 'react';
import { ActionIcon, Tooltip, Loader } from '@mantine/core';
import { IconBell, IconBellOff } from '@tabler/icons-react';

export default function NotificationToggle() {
  const [muted, setMuted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // ✅ Получить текущий статус оповещений
  const loadStatus = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, { headers });
      if (!res.ok) throw new Error('Ошибка при получении');
      const data = await res.json();
      setMuted(data.muted);
    } catch (err) {
      console.error('Ошибка загрузки статуса уведомлений:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Переключить статус
  const toggleNotifications = async () => {
    if (muted === null) return;
    try {
      const res = await fetch(`${API}/api/notifications`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ muted: !muted }),
      });
      if (res.ok) {
        setMuted(!muted);
      } else {
        console.error('Не удалось обновить статус оповещений');
      }
    } catch (err) {
      console.error('Ошибка при переключении уведомлений:', err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) return <Loader size="xs" />;

  return (
    <Tooltip label={muted ? 'Оповещения выключены' : 'Оповещения включены'}>
      <ActionIcon
        variant="light"
        color={muted ? 'gray' : 'blue'}
        onClick={toggleNotifications}
        radius="xl"
        size="lg"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 10,
        }}
      >
        {muted ? <IconBellOff size={20} /> : <IconBell size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}
