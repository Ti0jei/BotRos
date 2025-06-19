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
    } else {
      alert('Ошибка при удалении');
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url(/images/client-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '16px 0',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Container size="xs" style={{
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 80,
      }}>
        <Title order={2} ta="center" mb="md">Моё питание</Title>

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
          <Paper withBorder radius="md" p="md" mb="md" shadow="sm" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <Group justify="space-between" mb="xs">
              <Text fw={600}>{dayjs(selectedRecord.date).format('DD MMM YYYY')}</Text>
              <Badge color="blue">{selectedRecord.calories} ККАЛ</Badge>
            </Group>
            <Group gap="xs" mb="xs">
              <Badge color="green">Б: {selectedRecord.protein} г</Badge>
              <Badge color="yellow">Ж: {selectedRecord.fat} г</Badge>
              <Badge color="cyan">У: {selectedRecord.carbs} г</Badge>
            </Group>
            {!isAdmin && (
              <Group justify="space-between">
                <Button size="xs" variant="light" leftIcon={<IconEdit size={14} />} onClick={() => {
                  setFormVisible(true);
                  setCalories(selectedRecord.calories);
                  setProtein(selectedRecord.protein);
                  setFat(selectedRecord.fat);
                  setCarbs(selectedRecord.carbs);
                }}>
                  Редактировать
                </Button>
                <Button size="xs" color="red" leftIcon={<IconTrash size={14} />} onClick={handleDelete}>
                  Удалить
                </Button>
              </Group>
            )}
          </Paper>
        ) : (
          <Text size="sm" color="dimmed" ta="center" mb="md">
            Нет данных за выбранный день
          </Text>
        )}

        {!isAdmin && !formVisible && (
          <Button
            fullWidth
            color="pink"
            leftIcon={<IconPlus size={16} />}
            onClick={() => {
              setCalories('');
              setProtein('');
              setFat('');
              setCarbs('');
              setFormVisible(true);
            }}
          >
            Внести КБЖУ
          </Button>
        )}

        {!isAdmin && formVisible && (
          <Paper withBorder radius="md" p="md" mt="md" shadow="sm" style={{ background: 'rgba(255,255,255,0.6)' }}>
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
            <Button fullWidth mt="md" color="pink" onClick={handleSave}>
              💾 Сохранить
            </Button>
          </Paper>
        )}

        <Divider my="md" label="Сводка" labelPosition="center" />

        {loading ? (
          <Center>
            <Loader />
          </Center>
        ) : (
          <Stack>
            {weekly && (
              <Paper withBorder radius="md" p="md" shadow="xs" style={{ background: 'rgba(255,255,255,0.6)' }}>
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
              <Paper withBorder radius="md" p="md" shadow="xs" style={{ background: 'rgba(255,255,255,0.6)' }}>
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

        <Box mt="lg" ta="center">
          <Button
            variant="light"
            color="blue"
            size="sm"
            leftIcon={<IconArrowBack size={14} />}
            onClick={onBack}
            style={{ marginTop: 20 }}
          >
            Назад к профилю
          </Button>
        </Box>
      </Container>
    </div>
  );
}
