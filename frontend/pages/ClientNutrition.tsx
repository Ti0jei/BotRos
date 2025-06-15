// frontend/src/components/ClientNutrition.tsx
import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Stack,
  Text,
  Loader,
  Button,
  Paper,
  Group,
  Badge,
  Divider,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconPlugConnected } from '@tabler/icons-react';

interface NutritionDay {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Summary {
  period: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export default function ClientNutrition({
  userId,
  onBack,
}: {
  userId: string;
  onBack: () => void;
}) {
  const [data, setData] = useState<NutritionDay[]>([]);
  const [weekly, setWeekly] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<Summary | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/api/fatsecret/nutrition/${userId}`, { headers }).then(res => res.json()),
      fetch(`${API}/api/fatsecret/summary/${userId}?period=week`, { headers }).then(res => res.json()),
      fetch(`${API}/api/fatsecret/summary/${userId}?period=month`, { headers }).then(res => res.json()),
      fetch(`${API}/api/fatsecret/status`, { headers }).then(res => res.json()),
    ])
      .then(([nutrition, week, month, status]) => {
        setData(Array.isArray(nutrition) ? nutrition : []);
        setWeekly(week);
        setMonthly(month);
        setConnected(status.connected);
      })
      .catch((err) => {
        console.error('Ошибка загрузки питания:', err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleReset = async () => {
    if (!window.confirm('Отключить FatSecret у клиента?')) return;
    setResetting(true);
    const res = await fetch(`${API}/api/fatsecret/token/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert('FatSecret отключён');
      setConnected(false);
    } else {
      alert('Ошибка при сбросе');
    }
    setResetting(false);
  };

  const handleConnect = () => {
    window.open(`${API}/api/fatsecret/authorize?userId=${userId}`, '_blank');
  };

  return (
    <Container py="xl" style={{ paddingBottom: 70 }}>
      <Title order={2} mb="md">Питание клиента</Title>

      {connected === false && (
        <>
          <Alert icon={<IconAlertCircle />} title="Не подключено" color="red" mb="md">
            Клиент не авторизовался в FatSecret.
          </Alert>
          <Button
            leftIcon={<IconPlugConnected />}
            color="green"
            onClick={handleConnect}
            mb="md"
          >
            Подключить FatSecret
          </Button>
        </>
      )}

      {connected && (
        <Button color="red" variant="outline" size="xs" mb="md" onClick={handleReset} loading={resetting}>
          ⛔ Сбросить подключение FatSecret
        </Button>
      )}

      {loading ? (
        <Loader />
      ) : (
        <>
          {weekly && (
            <Paper withBorder p="md" radius="md" mb="sm">
              <Text fw={600} mb={6}>Итого за неделю</Text>
              <Group gap="xs">
                <Badge color="blue">Ккал: {weekly.calories}</Badge>
                <Badge color="green">Б: {weekly.protein}</Badge>
                <Badge color="yellow">Ж: {weekly.fat}</Badge>
                <Badge color="cyan">У: {weekly.carbs}</Badge>
              </Group>
            </Paper>
          )}

          {monthly && (
            <Paper withBorder p="md" radius="md" mb="lg">
              <Text fw={600} mb={6}>Итого за месяц</Text>
              <Group gap="xs">
                <Badge color="blue">Ккал: {monthly.calories}</Badge>
                <Badge color="green">Б: {monthly.protein}</Badge>
                <Badge color="yellow">Ж: {monthly.fat}</Badge>
                <Badge color="cyan">У: {monthly.carbs}</Badge>
              </Group>
            </Paper>
          )}

          <Divider mb="md" label="История по дням" />

          {data.length === 0 ? (
            <Text size="sm" color="dimmed">
              Нет данных по питанию
            </Text>
          ) : (
            <Stack spacing="sm">
              {data.map((entry) => (
                <Paper key={entry.date} withBorder p="md" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>{entry.date}</Text>
                    <Badge color="blue">{entry.calories} ккал</Badge>
                  </Group>
                  <Group gap="xs">
                    <Badge color="green">Б: {entry.protein} г</Badge>
                    <Badge color="yellow">Ж: {entry.fat} г</Badge>
                    <Badge color="cyan">У: {entry.carbs} г</Badge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </>
      )}

      {/* Кнопка назад */}
      <div style={{
        position: 'fixed',
        bottom: 10,
        left: 0,
        width: '100%',
        background: 'white',
        padding: '8px 0',
        textAlign: 'center',
        boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
        zIndex: 1000,
      }}>
        <Button
          variant="subtle"
          color="blue"
          size="sm"
          onClick={onBack}
          leftIcon={<span style={{ fontSize: 16 }}>←</span>}
        >
          Назад к профилю
        </Button>
      </div>
    </Container>
  );
}
