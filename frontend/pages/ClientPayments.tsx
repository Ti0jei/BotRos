// frontend/pages/ClientPayments.tsx
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  NumberInput,
  Divider,
  Paper,
  Box,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import {
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconCheck,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

interface Client {
  id: string;
  name: string;
}

interface PaymentBlock {
  id: string;
  date: string;
  paidTrainings: number;
  used: number;
  pricePerTraining: number;
  pricePerBlock?: number;
  active: boolean;
}

export default function ClientPayments({
  client,
  onBack,
}: {
  client: Client;
  onBack: () => void;
}) {
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState<Date | null>(new Date());
  const [paidTrainings, setPaidTrainings] = useState<number>(8);
  const [pricePerTraining, setPricePerTraining] = useState<number>(600);
  const [pricePerBlock, setPricePerBlock] = useState<number>(4800);
  const [used, setUsed] = useState<number>(0);

  const [editMode, setEditMode] = useState(false);

  const syncFromTraining = (val: number) => {
    setPricePerTraining(val);
    setPricePerBlock(val * paidTrainings);
  };

  const syncFromBlock = (val: number) => {
    setPricePerBlock(val);
    setPricePerTraining(paidTrainings > 0 ? Math.round(val / paidTrainings) : 0);
  };

  const syncFromTrainings = (val: number) => {
    setPaidTrainings(val);
    setPricePerBlock(val * pricePerTraining);
  };

  const loadBlock = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/payment-blocks/user/${client.id}/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setBlock(data);
      setDate(new Date(data.date));
      setPaidTrainings(data.paidTrainings);
      setPricePerTraining(data.pricePerTraining);
      setPricePerBlock(data.pricePerBlock || data.pricePerTraining * data.paidTrainings);
      setUsed(data.used);
    } else {
      setBlock(null);
    }

    setLoading(false);
  };

  const createBlock = async () => {
    const confirm = window.confirm('Создать новый блок оплаты?');
    if (!confirm) return;

    const res = await fetch(`${API}/api/payment-blocks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: client.id,
        paidAt: date,
        paidTrainings,
        pricePerTraining,
        pricePerBlock,
      }),
    });

    if (res.ok) {
      showNotification({
        title: 'Блок создан',
        message: 'Новая оплата успешно добавлена',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      await loadBlock();
    } else {
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось добавить блок оплаты',
        color: 'red',
      });
    }
  };

  const updateBlock = async () => {
    if (!block) return;

    const res = await fetch(`${API}/api/payment-blocks/${block.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paidAt: date,
        paidTrainings,
        pricePerTraining,
        pricePerBlock,
        used,
      }),
    });

    if (res.ok) {
      showNotification({
        title: 'Обновлено',
        message: 'Блок оплаты обновлён',
        color: 'green',
      });
      setEditMode(false);
      await loadBlock();
    } else {
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось обновить блок',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    loadBlock();
  }, []);

  const pinkButtonSx = {
    backgroundColor: 'transparent',
    color: '#d6336c',
    fontWeight: 500,
    borderRadius: 8,
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#ffe3ed',
    },
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  };

  return (
    <Box style={{ backgroundColor: '#f5d4ca', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={3} mb="md" style={{ color: '#222' }}>
          💸 Оплаты — {client.name}
        </Title>

        {loading ? (
          <Text>Загрузка...</Text>
        ) : block ? (
          <Paper style={cardStyle} mb="md">
            <Group position="apart" mb="xs">
              <Text fw={500}>Активный блок</Text>
              <Badge color={block.used >= block.paidTrainings ? 'red' : 'green'}>
                {block.used} / {block.paidTrainings}
              </Badge>
            </Group>

            {editMode ? (
              <Stack>
                <DatePickerInput
                  label="Дата оплаты"
                  value={date}
                  onChange={setDate}
                  locale="ru"
                  dropdownType="popover"
                  clearable={false}
                  radius="md"
                  size="md"
                  nextIcon={<IconChevronRight size={16} />}
                  previousIcon={<IconChevronLeft size={16} />}
                />

                <NumberInput
                  label="Кол-во тренировок"
                  value={paidTrainings}
                  onChange={(v) => syncFromTrainings(Number(v))}
                  min={1}
                />

                <NumberInput
                  label="Цена за тренировку, ₽"
                  value={pricePerTraining}
                  onChange={(v) => syncFromTraining(Number(v))}
                  min={1}
                />

                <NumberInput
                  label="Цена за блок, ₽"
                  value={pricePerBlock}
                  onChange={(v) => syncFromBlock(Number(v))}
                  min={1}
                />

                <NumberInput
                  label="Уже использовано"
                  value={used}
                  onChange={(v) => setUsed(Number(v))}
                  min={0}
                  max={paidTrainings}
                />

                <Button onClick={updateBlock} color="pink">
                  💾 Сохранить изменения
                </Button>
              </Stack>
            ) : (
              <Stack spacing="xs">
                <Text size="sm" color="dimmed">
                  Дата оплаты: {dayjs(block.date).format('DD.MM.YYYY')}
                </Text>
                <Text size="sm" color="dimmed">
                  Цена: {block.pricePerTraining}₽
                </Text>
                <Text size="sm" color="dimmed">
                  Всего тренировок: {block.paidTrainings}
                </Text>
                <Text size="sm" color="dimmed">
                  Использовано: {block.used}
                </Text>
                <Text size="sm" fw={600}>
                  Осталось: {block.paidTrainings - block.used}
                </Text>
                <Text size="sm" fw={500}>
                  Цена блока: {block.pricePerBlock || pricePerBlock}₽
                </Text>

                <Button
                  mt="xs"
                  variant="outline"
                  color="pink"
                  leftIcon={<IconEdit size={16} />}
                  onClick={() => setEditMode(true)}
                >
                  Редактировать
                </Button>
              </Stack>
            )}
          </Paper>
        ) : (
          <>
            <Text color="red" fw={600} mt="sm">
              🔴 Блок не оплачен
            </Text>
            <Divider my="sm" />
            <Title order={4} mb="xs">
              ➕ Добавить блок
            </Title>

            <Paper style={cardStyle} mt="sm">
              <Stack>
                <DatePickerInput
                  label="Дата оплаты"
                  value={date}
                  onChange={setDate}
                  locale="ru"
                  dropdownType="popover"
                  clearable={false}
                  radius="md"
                  size="md"
                  nextIcon={<IconChevronRight size={16} />}
                  previousIcon={<IconChevronLeft size={16} />}
                />

                <NumberInput
                  label="Кол-во тренировок"
                  value={paidTrainings}
                  onChange={(v) => syncFromTrainings(Number(v))}
                  min={1}
                />

                <NumberInput
                  label="Цена за тренировку, ₽"
                  value={pricePerTraining}
                  onChange={(v) => syncFromTraining(Number(v))}
                  min={1}
                />

                <NumberInput
                  label="Цена за блок, ₽"
                  value={pricePerBlock}
                  onChange={(v) => syncFromBlock(Number(v))}
                  min={1}
                />

                <Text size="sm" mt={-4} c="dimmed">
                  💰 Итого: {pricePerBlock}₽
                </Text>

                <Button color="pink" onClick={createBlock}>
                  💾 Сохранить
                </Button>
              </Stack>
            </Paper>
          </>
        )}

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
          <Button
            variant="subtle"
            sx={pinkButtonSx}
            size="sm"
            onClick={onBack}
            leftIcon={<span style={{ fontSize: 16 }}>←</span>}
          >
            Назад к профилю
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
