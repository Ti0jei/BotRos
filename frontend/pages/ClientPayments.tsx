import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  IconEdit,
  IconArrowLeft,
} from "@tabler/icons-react";
import {
  Text,
  Title,
  Stack,
  Card,
  Center,
  TextInput,
  NumberInput,
  Loader,
  Divider,
} from "@mantine/core";

import ActionButton from "@/components/ui/ActionButton";
import StatusBadge from "@/components/ui/StatusBadge";

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

export default function ClientPayments({ client, onBack }: { client: Client; onBack: () => void }) {
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [paidTrainings, setPaidTrainings] = useState<number>(8);
  const [pricePerTraining, setPricePerTraining] = useState<number>(600);
  const [pricePerBlock, setPricePerBlock] = useState<number>(4800);
  const [used, setUsed] = useState<number>(0);

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
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      setBlock(data);
      setDate(dayjs(data.date).format("YYYY-MM-DD"));
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
    if (!window.confirm("Создать новый блок оплаты?")) return;

    const res = await fetch(`${API}/api/payment-blocks`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId: client.id,
        paidAt: date,
        paidTrainings,
        pricePerTraining,
        pricePerBlock,
      }),
    });

    if (res.ok) {
      alert("Блок создан");
      await loadBlock();
    } else {
      alert("Ошибка при создании блока");
    }
  };

  const updateBlock = async () => {
    if (!block) return;

    const res = await fetch(`${API}/api/payment-blocks/${block.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        paidAt: date,
        paidTrainings,
        pricePerTraining,
        pricePerBlock,
        used,
      }),
    });

    if (res.ok) {
      alert("Обновлено");
      setEditMode(false);
      await loadBlock();
    } else {
      alert("Ошибка при обновлении");
    }
  };

  useEffect(() => {
    loadBlock();
  }, []);

  return (
    <Center
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        padding: "2rem 1rem",
      }}
    >
      <Card withBorder radius="xl" p="xl" shadow="xs" style={{ width: "100%", maxWidth: 420 }}>
        <Stack spacing="lg">
          <Title order={3} c="#1a1a1a">
            💸 Оплата — {client.name}
          </Title>

          {loading ? (
            <Loader size="sm" />
          ) : block ? (
            <Stack spacing="sm">
              <Group position="apart">
                <Text size="sm" c="dimmed">
                  Использовано:
                </Text>
                <StatusBadge
                  status={block.used >= block.paidTrainings ? "declined" : "active"}
                >
                  {block.used} / {block.paidTrainings}
                </StatusBadge>
              </Group>

              {editMode ? (
                <Stack spacing="sm">
                  <TextInput label="Дата оплаты" value={date} onChange={(e) => setDate(e.currentTarget.value)} type="date" radius="xl" />
                  <NumberInput label="Кол-во тренировок" value={paidTrainings} onChange={syncFromTrainings} min={1} radius="xl" />
                  <NumberInput label="Цена за тренировку" value={pricePerTraining} onChange={syncFromTraining} min={1} radius="xl" />
                  <NumberInput label="Цена за блок" value={pricePerBlock} onChange={syncFromBlock} min={1} radius="xl" />
                  <NumberInput label="Использовано" value={used} onChange={setUsed} min={0} max={paidTrainings} radius="xl" />

                  <ActionButton onClick={updateBlock} fullWidth>
                    💾 Сохранить
                  </ActionButton>
                </Stack>
              ) : (
                <Stack spacing={4}>
                  <Text size="sm">Дата оплаты: {dayjs(block.date).format("DD.MM.YYYY")}</Text>
                  <Text size="sm">Цена за тренировку: {block.pricePerTraining}₽</Text>
                  <Text size="sm">Всего: {block.paidTrainings}</Text>
                  <Text size="sm">Использовано: {block.used}</Text>
                  <Text size="sm">Осталось: {block.paidTrainings - block.used}</Text>
                  <Text size="sm" fw={500}>Сумма: {block.pricePerBlock || pricePerBlock}₽</Text>

                  <ActionButton variant="outline" onClick={() => setEditMode(true)} leftIcon={<IconEdit size={16} />} fullWidth>
                    Редактировать
                  </ActionButton>
                </Stack>
              )}
            </Stack>
          ) : (
            <Stack spacing="sm">
              <Text size="sm" c="red">
                Блок не найден
              </Text>

              <TextInput label="Дата оплаты" value={date} onChange={(e) => setDate(e.currentTarget.value)} type="date" radius="xl" />
              <NumberInput label="Кол-во тренировок" value={paidTrainings} onChange={syncFromTrainings} min={1} radius="xl" />
              <NumberInput label="Цена за тренировку" value={pricePerTraining} onChange={syncFromTraining} min={1} radius="xl" />
              <NumberInput label="Цена за блок" value={pricePerBlock} onChange={syncFromBlock} min={1} radius="xl" />

              <Divider my="sm" />
              <Text size="sm" c="dimmed">
                💰 Итого: {pricePerBlock}₽
              </Text>

              <ActionButton onClick={createBlock} fullWidth>
                ➕ Создать блок
              </ActionButton>
            </Stack>
          )}

          <ActionButton
            variant="outline"
            colorStyle="black"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={onBack}
            fullWidth
          >
            Назад
          </ActionButton>
        </Stack>
      </Card>
    </Center>
  );
}
