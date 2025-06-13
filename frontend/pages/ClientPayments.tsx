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
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
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
  active: boolean;
}

export default function ClientPayments({ client, onBack }: { client: Client; onBack: () => void }) {
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState<Date | null>(new Date());
  const [paidTrainings, setPaidTrainings] = useState<number>(8);
  const [pricePerTraining, setPricePerTraining] = useState<number>(600);
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
      setPaidTrainings(data.paidTrainings);
      setPricePerTraining(data.pricePerTraining);
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
        paidAt: date,
        paidTrainings,
        pricePerTraining,
      }),
    });

    if (res.ok) {
      showNotification({ title: 'Блок создан', message: 'Новая оплата успешно добавлена', color: 'green' });
      setDate(new Date());
      setPaidTrainings(8);
      setPricePerTraining(600);
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
        paidAt: date,
        paidTrainings,
        pricePerTraining,
        used,
      }),
    });

    if (res.ok) {
      showNotification({ title: 'Обновлено', message: 'Блок оплаты обновлён', color: 'green' });
      setEditMode(false);
      await loadBlock();
    } else {
      showNotification({ title: 'Ошибка', message: 'Не удалось обновить блок', color: 'red' });
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
                popoverProps={{
                  withinPortal: true,
                  shadow: 'md',
                  radius: 'md',
                  position: 'bottom-start',
                }}
              />

              <NumberInput
                label="Кол-во тренировок"
                value={paidTrainings}
                onChange={(v) => setPaidTrainings(Number(v))}
                min={1}
              />

              <NumberInput
                label="Цена за тренировку, ₽"
                value={pricePerTraining}
                onChange={(v) => setPricePerTraining(Number(v))}
                min={1}
              />

              <NumberInput
                label="Уже использовано"
                value={used}
                onChange={(v) => setUsed(Number(v))}
                min={0}
                max={paidTrainings}
              />

              <Button onClick={updateBlock} color="blue">💾 Сохранить изменения</Button>
            </Stack>
          ) : (
            <>
              <Text size="sm" color="dimmed">Дата оплаты: {dayjs(block.date).format('DD.MM.YYYY')}</Text>
              <Text size="sm" color="dimmed">Цена: {block.pricePerTraining}₽</Text>
              <Text size="sm" color="dimmed">Всего тренировок: {block.paidTrainings}</Text>
              <Text size="sm" color="dimmed">Использовано: {block.used}</Text>
              <Text size="sm" fw={600}>
                Осталось: {block.paidTrainings - block.used}
              </Text>
              <Button mt="sm" variant="light" onClick={() => setEditMode(true)}>
                ✏️ Редактировать
              </Button>
            </>
          )}
        </Paper>
      ) : (
        <>
          <Divider my="sm" />
          <Title order={4} mb="xs">➕ Добавить блок</Title>

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
            popoverProps={{
              withinPortal: true,
              shadow: 'md',
              radius: 'md',
              position: 'bottom-start',
            }}
          />

          <NumberInput
            label="Кол-во тренировок"
            value={paidTrainings}
            onChange={(v) => setPaidTrainings(Number(v))}
            min={1}
            mt="sm"
          />

          <NumberInput
            label="Цена за тренировку, ₽"
            value={pricePerTraining}
            onChange={(v) => setPricePerTraining(Number(v))}
            min={1}
            mt="sm"
          />

          <Button fullWidth mt="md" onClick={createBlock}>Сохранить</Button>
        </>
      )}

      <Button fullWidth mt="lg" variant="subtle" onClick={onBack}>← Назад</Button>
    </Container>
  );
}
