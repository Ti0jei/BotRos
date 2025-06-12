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
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface Client {
  id: string;
  name: string;
}

interface PaymentBlock {
  id: string;
  date: string;
  sessions: number;
  used: number;
  price: number;
  active: boolean;
}

export default function ClientPayments({ client, onBack }: { client: Client; onBack: () => void }) {
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState<Date | null>(new Date());
  const [sessions, setSessions] = useState<number>(8);
  const [price, setPrice] = useState<number>(600);
  const [used, setUsed] = useState<number>(0);

  const [editMode, setEditMode] = useState(false);

  const loadBlock = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/payment-blocks/user/${client.id}/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setBlock(data);
      setDate(new Date(data.date));
      setSessions(data.sessions);
      setPrice(data.price);
      setUsed(data.used);
    } else {
      setBlock(null);
    }
    setLoading(false);
  };

  const createBlock = async () => {
    const res = await fetch(`${API}/api/payment-blocks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: client.id,
        date,
        sessions,
        price,
      }),
    });

    if (res.ok) {
      showNotification({ title: 'Блок создан', message: 'Новая оплата успешно добавлена', color: 'green' });
      setDate(new Date());
      setSessions(8);
      setPrice(600);
      await loadBlock();
    } else {
      showNotification({ title: 'Ошибка', message: 'Не удалось добавить блок оплаты', color: 'red' });
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
        date,
        sessions,
        price,
        used,
      }),
    });

    if (res.ok) {
      showNotification({ title: 'Обновлено', message: 'Блок оплаты обновлён', color: 'green' });
      setEditMode(false);
      await loadBlock();
    } else {
      showNotification({ title: 'Ошибка', message: 'Не удалось обновить', color: 'red' });
    }
  };

  useEffect(() => {
    loadBlock();
  }, []);

  return (
    <Container>
      <Title order={2} mb="md">💸 Оплаты — {client.name}</Title>

      {loading ? (
        <Text>Загрузка...</Text>
      ) : block ? (
        <Paper withBorder p="md" mb="md" shadow="xs">
          <Group position="apart" mb="xs">
            <Text fw={500}>Активный блок</Text>
            <Badge color={block.used >= block.sessions ? 'red' : 'green'}>
              {block.used} / {block.sessions}
            </Badge>
          </Group>

          {editMode ? (
            <Stack>
              <DatePickerInput
                label="Дата оплаты"
                value={date}
                onChange={setDate}
                locale="ru"
                allowDeselect={false}
                popoverProps={{ withinPortal: true }}
              />
              <NumberInput label="Кол-во тренировок" value={sessions} onChange={(v) => setSessions(Number(v))} min={1} />
              <NumberInput label="Цена за тренировку, ₽" value={price} onChange={(v) => setPrice(Number(v))} min={1} />
              <NumberInput label="Уже использовано" value={used} onChange={(v) => setUsed(Number(v))} min={0} max={sessions} />
              <Button onClick={updateBlock} color="blue">💾 Сохранить изменения</Button>
            </Stack>
          ) : (
            <>
              <Text size="sm" color="dimmed">Дата оплаты: {dayjs(block.date).format('DD.MM.YYYY')}</Text>
              <Text size="sm" color="dimmed">Цена: {block.price}₽</Text>
              <Text size="sm" color="dimmed">Всего тренировок: {block.sessions}</Text>
              <Text size="sm" color="dimmed">Использовано: {block.used}</Text>
              <Button mt="sm" variant="light" onClick={() => setEditMode(true)}>
                ✏️ Редактировать
              </Button>
            </>
          )}
        </Paper>
      ) : (
        <Text color="dimmed">Нет активного блока.</Text>
      )}

      <Divider my="sm" />

      <Title order={4} mb="xs">➕ Добавить блок</Title>

      <DatePickerInput
        label="Дата оплаты"
        value={date}
        onChange={setDate}
        locale="ru"
        allowDeselect={false}
        popoverProps={{ withinPortal: true }}
      />
      <NumberInput
        label="Кол-во тренировок"
        value={sessions}
        onChange={(v) => setSessions(Number(v))}
        min={1}
        mt="sm"
      />
      <NumberInput
        label="Цена за тренировку, ₽"
        value={price}
        onChange={(v) => setPrice(Number(v))}
        min={1}
        mt="sm"
      />

      <Button fullWidth mt="md" onClick={createBlock}>Сохранить</Button>
      <Button fullWidth mt="lg" variant="subtle" onClick={onBack}>← Назад</Button>
    </Container>
  );
}