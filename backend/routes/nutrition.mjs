// src/pages/ClientNutrition.tsx
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
  NumberInput,
  Center,
  SimpleGrid,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

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
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState<Date | null>(new Date());
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/nutrition/${userId}`, { headers }).then(res => res.json()),
      fetch(`${API}/api/nutrition/summary/${userId}?period=week`, { headers }).then(res => res.json()),
      fetch(`${API}/api/nutrition/summary/${userId}?period=month`, { headers }).then(res => res.json()),
    ])
      .then(([nutrition, week, month]) => {
        setData(Array.isArray(nutrition) ? nutrition : []);
        setWeekly(week);
        setMonthly(month);
      })
      .catch((err) => {
        console.error('Ошибка загрузки питания:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleSave = async () => {
    if (!date || calories === '' || protein === '' || fat === '' || carbs === '') {
      alert('Заполните все поля');
      return;
    }

    const res = await fetch(`${API}/api/nutrition`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        date: dayjs(date).format('YYYY-MM-DD'),
        calories,
        protein,
        fat,
        carbs,
      }),
    });

    if (res.ok) {
      loadData();
      alert('Сохранено');
    } else {
      alert('Ошибка при сохранении');
    }
  };

  return (
    <Container size="sm" py="md" style={{ paddingBottom: 80 }}>
      <Title order={2} mb="lg">Питание</Title>

      <Paper withBorder radius="md" p="md" mb="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <DatePickerInput
            label="Дата"
            value={date}
            onChange={setDate}
            maxDate={new Date()}
            leftSection={<IconCalendar size={16} />}
            leftSectionPointerEvents="none"
            nextIcon={<IconChevronRight size={16} />}
            previousIcon={<IconChevronLeft size={16} />}
          />
          <NumberInput label="Калории" value={calories} onChange={setCalories} hideControls />
          <NumberInput label="Белки" value={protein} onChange={setProtein} hideControls />
          <NumberInput label="Жиры" value={fat} onChange={setFat} hideControls />
          <NumberInput label="Углеводы" value={carbs} onChange={setCarbs} hideControls />
        </SimpleGrid>
        <Button fullWidth mt="md" onClick={handleSave}>
          Сохранить
        </Button>
      </Paper>

      {loading ? (
        <Center><Loader /></Center>
      ) : (
        <>
          {weekly && (
            <Paper withBorder radius="md" p="md" mb="sm">
              <Text fw={600} mb={4}>Итого за неделю</Text>
              <Group gap="xs">
                <Badge color="blue">Ккал: {weekly.calories}</Badge>
                <Badge color="green">Б: {weekly.protein}</Badge>
                <Badge color="yellow">Ж: {weekly.fat}</Badge>
                <Badge color="cyan">У: {weekly.carbs}</Badge>
              </Group>
            </Paper>
          )}

          {monthly && (
            <Paper withBorder radius="md" p="md" mb="sm">
              <Text fw={600} mb={4}>Итого за месяц</Text>
              <Group gap="xs">
                <Badge color="blue">Ккал: {monthly.calories}</Badge>
                <Badge color="green">Б: {monthly.protein}</Badge>
                <Badge color="yellow">Ж: {monthly.fat}</Badge>
                <Badge color="cyan">У: {monthly.carbs}</Badge>
              </Group>
            </Paper>
          )}

          <Divider my="md" label="История по дням" />

          <Stack>
            {data.length === 0 ? (
              <Text size="sm" color="dimmed">Нет данных</Text>
            ) : (
              data.map(entry => (
                <Paper key={entry.date} withBorder radius="md" p="md">
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
              ))
            )}
          </Stack>
        </>
      )}

      <div style={{
        position: 'fixed',
        bottom: 10,
        left: 0,
        width: '100%',
        background: 'white',
        padding: '10px 0',
        textAlign: 'center',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
        zIndex: 1000,
      }}>
        <Button
          variant="light"
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
