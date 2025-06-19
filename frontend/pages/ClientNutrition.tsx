import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Badge,
  Text,
  Button,
  NumberInput,
  Divider,
  Center,
  Stack,
  Loader,
  Grid,
  Box,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconEdit,
  IconPlus,
  IconArrowBack,
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
  isAdmin = false,
}: {
  userId: string;
  onBack: () => void;
  isAdmin?: boolean;
}) {
  const [data, setData] = useState<NutritionDay[]>([]);
  const [weekly, setWeekly] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [formVisible, setFormVisible] = useState(false);

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
      fetch(`${API}/api/nutrition/${userId}`, { headers }).then((res) => res.json()),
      fetch(`${API}/api/nutrition/summary/${userId}?period=week`, { headers }).then((res) => res.json()),
      fetch(`${API}/api/nutrition/summary/${userId}?period=month`, { headers }).then((res) => res.json()),
    ])
      .then(([nutrition, week, month]) => {
        setData(Array.isArray(nutrition) ? nutrition : []);
        setWeekly(week);
        setMonthly(month);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const selectedRecord = data.find(
    (d) => dayjs(d.date).format('YYYY-MM-DD') === dayjs(selectedDate).format('YYYY-MM-DD')
  );

  const handleSave = async () => {
    if (!selectedDate || calories === '' || protein === '' || fat === '' || carbs === '') {
      alert('Заполните все поля');
      return;
    }

    const res = await fetch(`${API}/api/nutrition`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
        calories,
        protein,
        fat,
        carbs,
      }),
    });

    if (res.ok) {
      loadData();
      setFormVisible(false);
      alert('Сохранено');
    } else {
      alert('Ошибка при сохранении');
    }
  };

  const handleDelete = async () => {
    if (!selectedDate) return;
    const res = await fetch(
      `${API}/api/nutrition/${userId}/${dayjs(selectedDate).format('YYYY-MM-DD')}`,
      { method: 'DELETE', headers }
    );
    if (res.ok) {
      loadData();
      alert('Удалено');
    } else {
      alert('Ошибка при удалении');
    }
  };

  return (
    <Container size="xs" pt="md" pb={90}>
      <Title order={2} ta="center" mb="md">
        Питание
      </Title>

      <DatePickerInput
        value={selectedDate}
        onChange={(val) => {
          setSelectedDate(val);
          setFormVisible(false);
        }}
        maxDate={new Date()}
        leftSection={<IconCalendar size={16} />}
        nextIcon={<IconChevronRight size={16} />}
        previousIcon={<IconChevronLeft size={16} />}
        mx="auto"
        mb="md"
      />

      {selectedRecord ? (
        <Paper withBorder p="md" radius="md" mb="md" shadow="xs">
          <Group justify="space-between" mb="xs">
            <Text fw={600}>{dayjs(selectedRecord.date).format('DD MMM YYYY')}</Text>
            <Badge color="blue">{selectedRecord.calories} ККАЛ</Badge>
          </Group>
          <Group gap="xs">
            <Badge color="green">Б: {selectedRecord.protein} Г</Badge>
            <Badge color="yellow">Ж: {selectedRecord.fat} Г</Badge>
            <Badge color="cyan">У: {selectedRecord.carbs} Г</Badge>
          </Group>

          {!isAdmin && (
            <Group mt="md" justify="space-between">
              <Button size="xs" variant="light" leftIcon={<IconEdit size={16} />} onClick={() => {
                setFormVisible(true);
                setCalories(selectedRecord.calories);
                setProtein(selectedRecord.protein);
                setFat(selectedRecord.fat);
                setCarbs(selectedRecord.carbs);
              }}>
                Редактировать
              </Button>
              <Button size="xs" color="red" leftIcon={<IconTrash size={16} />} onClick={handleDelete}>
                Удалить
              </Button>
            </Group>
          )}
        </Paper>
      ) : (
        <Text size="sm" color="dimmed" mb="sm" ta="center">
          Нет данных за выбранный день
        </Text>
      )}

      {!isAdmin && !formVisible && (
        <Button
          fullWidth
          variant="filled"
          color="pink"
          onClick={() => {
            setCalories('');
            setProtein('');
            setFat('');
            setCarbs('');
            setFormVisible(true);
          }}
          leftIcon={<IconPlus size={16} />}
        >
          Внести КБЖУ
        </Button>
      )}

      {!isAdmin && formVisible && (
        <Paper withBorder p="md" radius="md" mt="md">
          <Grid gutter="md">
            <Grid.Col span={6}>
              <NumberInput label="Калории" value={calories} onChange={setCalories} min={0} hideControls />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput label="Белки" value={protein} onChange={setProtein} min={0} hideControls />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput label="Жиры" value={fat} onChange={setFat} min={0} hideControls />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput label="Углеводы" value={carbs} onChange={setCarbs} min={0} hideControls />
            </Grid.Col>
          </Grid>
          <Button mt="md" fullWidth color="pink" onClick={handleSave}>
            💾 Сохранить
          </Button>
        </Paper>
      )}

      <Divider my="md" label="Сводка" />

      {loading ? (
        <Center><Loader /></Center>
      ) : (
        <Stack>
          {weekly && (
            <Paper withBorder p="md" radius="md" shadow="xs">
              <Text fw={600} mb={4}>Итого за неделю</Text>
              <Group gap="xs">
                <Badge color="blue">ККАЛ: {weekly.calories}</Badge>
                <Badge color="green">Б: {weekly.protein}</Badge>
                <Badge color="yellow">Ж: {weekly.fat}</Badge>
                <Badge color="cyan">У: {weekly.carbs}</Badge>
              </Group>
            </Paper>
          )}
          {monthly && (
            <Paper withBorder p="md" radius="md" shadow="xs">
              <Text fw={600} mb={4}>Итого за месяц</Text>
              <Group gap="xs">
                <Badge color="blue">ККАЛ: {monthly.calories}</Badge>
                <Badge color="green">Б: {monthly.protein}</Badge>
                <Badge color="yellow">Ж: {monthly.fat}</Badge>
                <Badge color="cyan">У: {monthly.carbs}</Badge>
              </Group>
            </Paper>
          )}
        </Stack>
      )}

      <Box
        style={{
          position: 'fixed',
          bottom: 10,
          left: 0,
          width: '100%',
          background: 'white',
          padding: '10px 0',
          textAlign: 'center',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
          zIndex: 1000,
        }}
      >
        <Button variant="light" color="blue" size="sm" onClick={onBack} leftIcon={<IconArrowBack size={16} />}>
          Назад к профилю
        </Button>
      </Box>
    </Container>
  );
}
