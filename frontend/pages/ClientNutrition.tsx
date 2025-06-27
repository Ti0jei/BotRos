import React, { useState, useEffect } from 'react';
import {
  Box,
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
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconEdit,
  IconPlus,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import BackToProfileButton from '../components/BackToProfileButton';

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
  isAdmin = false,
  onBack,
}: {
  userId: string;
  isAdmin?: boolean;
  onBack: () => void;
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

  const commonButtonStyle = {
    root: {
      color: '#d6336c',
      border: '1px solid #d6336c',
      borderRadius: 8,
      fontWeight: 500,
      backgroundColor: 'white',
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      height: 34,
      padding: '2px 10px',
      '&:hover': {
        backgroundColor: '#ffe3ed',
      },
    },
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
    const confirmed = window.confirm('Вы точно хотите удалить запись за этот день?');
    if (!confirmed) return;

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

  const cardStyle = {
    background: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: isAdmin ? '#f5d4ca' : '#e8b3a6', paddingBottom: 120 }}>
      <Box
        sx={{
          maxWidth: 420,
          margin: '0 auto',
          padding: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderRadius: 24,
          boxShadow: '0 0 12px rgba(0,0,0,0.1)',
        }}
      >
        <Title order={2} ta="center" mb="md" color="#222">
          {isAdmin ? 'Питание клиента' : 'Моё питание'}
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
          <Paper p="md" mb="md" style={cardStyle}>
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
                <Button
                  size="xs"
                  styles={commonButtonStyle}
                  onClick={() => {
                    setFormVisible(true);
                    setCalories(selectedRecord.calories);
                    setProtein(selectedRecord.protein);
                    setFat(selectedRecord.fat);
                    setCarbs(selectedRecord.carbs);
                  }}
                  leftIcon={<IconEdit size={14} />}
                >
                  Редактировать
                </Button>
                <Button
                  size="xs"
                  styles={commonButtonStyle}
                  variant="outline"
                  onClick={handleDelete}
                  leftIcon={<IconTrash size={14} />}
                >
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
            styles={commonButtonStyle}
            leftIcon={<IconPlus size={16} />}
            onClick={() => {
              setCalories('');
              setProtein('');
              setFat('');
              setCarbs('');
              setFormVisible(true);
            }}
            mb="md"
          >
            Внести КБЖУ
          </Button>
        )}

        {!isAdmin && formVisible && (
          <Paper radius="md" p="md" mt="md" style={cardStyle}>
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
            <Button
              fullWidth
              mt="md"
              styles={commonButtonStyle}
              onClick={handleSave}
              leftIcon={<IconPlus size={16} />}
            >
              Сохранить
            </Button>
          </Paper>
        )}

        <Divider my="md" label="Сводка" labelPosition="center" />

        {loading ? (
          <Center>
            <Loader />
          </Center>
        ) : (
          <Stack spacing="md">
            {weekly && (
              <Paper p="md" style={cardStyle}>
                <Text fw={600} mb={4}>
                  Итого за неделю
                </Text>
                <Group gap="xs">
                  <Badge color="blue">ККАЛ: {weekly.calories}</Badge>
                  <Badge color="green">Б: {weekly.protein}</Badge>
                  <Badge color="yellow">Ж: {weekly.fat}</Badge>
                  <Badge color="cyan">У: {weekly.carbs}</Badge>
                </Group>
              </Paper>
            )}
            {monthly && (
              <Paper p="md" style={cardStyle}>
                <Text fw={600} mb={4}>
                  Итого за месяц
                </Text>
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

        <Box h={100} />
      </Box>

      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'white',
          padding: '10px 0',
          textAlign: 'center',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
          zIndex: 1000,
        }}
      >
        <BackToProfileButton onBack={onBack} />
      </Box>
    </Box>
  );
}
