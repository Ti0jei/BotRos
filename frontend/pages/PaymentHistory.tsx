import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Table,
  Button,
  Loader,
  Text,
  Badge,
  Group,
  Stack,
} from '@mantine/core';

interface Props {
  userId: string;
  onBack: () => void;
}

interface PaymentBlock {
  id: string;
  paidAt: string;
  paidTrainings: number;
  used: number;
  pricePerTraining: number;
  active: boolean;
}

interface SingleTraining {
  id: string;
  date: string;
  hour: number;
}

export default function PaymentHistory({ userId, onBack }: Props) {
  const [blocks, setBlocks] = useState<PaymentBlock[]>([]);
  const [singleTrainings, setSingleTrainings] = useState<SingleTraining[]>([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const [blocksRes, singlesRes] = await Promise.all([
        fetch(`${API}/api/payment-blocks/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/trainings/single/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (blocksRes.ok) {
        const blockData = await blocksRes.json();
        setBlocks(blockData);
      }

      if (singlesRes.ok) {
        const singles = await singlesRes.json();
        setSingleTrainings(singles);
      }
    } catch (e) {
      console.error('Ошибка загрузки истории оплат:', e);
    }

    setLoading(false);
  };

  const markInactive = async (blockId: string) => {
    try {
      await fetch(`${API}/api/payment-blocks/${blockId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: false }),
      });
      await loadData();
    } catch (e) {
      console.error('Ошибка завершения блока:', e);
    }
  };

  return (
    <Container style={{ paddingBottom: 70 }}>
      <Title order={3} mb="md">История оплат</Title>

      {loading ? (
        <Loader />
      ) : (
        <Stack>
          <Title order={5}>Оплаченные блоки</Title>
          <Table withColumnBorders striped>
            <thead>
              <tr>
                <th>Дата оплаты</th>
                <th>Всего</th>
                <th>Исп.</th>
                <th>Цена</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.id}>
                  <td>{new Date(b.paidAt).toLocaleDateString()}</td>
                  <td>{b.paidTrainings}</td>
                  <td>{b.used}</td>
                  <td>{b.pricePerTraining} ₽</td>
                  <td>
                    <Badge color={b.active ? 'green' : 'gray'}>
                      {b.active ? 'Активен' : 'Завершён'}
                    </Badge>
                  </td>
                  <td>
                    {b.active && (
                      <Button size="xs" color="red" onClick={() => markInactive(b.id)}>
                        Завершить
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {singleTrainings.length > 0 && (
            <>
              <Title order={5} mt="lg">Разовые тренировки</Title>
              <Table withColumnBorders striped>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Время</th>
                  </tr>
                </thead>
                <tbody>
                  {singleTrainings.map((t) => (
                    <tr key={t.id}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{t.hour}:00</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Stack>
      )}

      {/* Закреплённая кнопка "Назад к профилю" */}
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
