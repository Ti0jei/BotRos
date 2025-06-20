import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Title,
  Paper,
  Text,
  Badge,
  Group,
} from '@mantine/core';
import { getToken } from '../utils/auth';
import { IconArrowBack } from '@tabler/icons-react';

interface PaymentBlock {
  id: string;
  paidAt: string;
  paidTrainings: number;
  used: number;
  pricePerTraining: number;
  active: boolean;
}

export default function ClientBlock({ onBack }: { onBack: () => void }) {
  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  const loadBlock = async () => {
    try {
      const res = await fetch(`${API}/api/payment-blocks/user/me/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBlock(data);
      } else {
        setBlock(null);
      }
    } catch (err) {
      console.error('Ошибка при загрузке блока:', err);
      setBlock(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlock();
    // eslint-disable-next-line
  }, []);

  return (
    <Box
      style={{
        background: '#f5d4ca',
        minHeight: '100vh',
        paddingBottom: 80,
        position: 'relative',
      }}
    >
      <Container size="xs" py="md">
        <Title order={3} mb="md" style={{ color: '#222', textAlign: 'center' }}>
          📦 Блок тренировок
        </Title>

        {loading ? (
          <Text ta="center">Загрузка...</Text>
        ) : !block ? (
          <Text color="red" ta="center">
            У вас нет активного блока.
          </Text>
        ) : (
          <Paper
            withBorder
            p="md"
            radius="md"
            shadow="sm"
            style={{
              backgroundColor: 'white',
              margin: '0 auto',
              maxWidth: 340,
            }}
          >
            <Group position="apart" mb="xs">
              <Text fw={600}>Дата оплаты</Text>
              <Text>{new Date(block.paidAt).toLocaleDateString()}</Text>
            </Group>
            <Text size="sm" color="dimmed" mb={4}>
              Всего тренировок: <b>{block.paidTrainings}</b>
            </Text>
            <Text size="sm" color="dimmed" mb={4}>
              Использовано: <b>{block.used}</b>
            </Text>
            <Text size="sm" color="dimmed" mb={4}>
              Осталось: <b>{block.paidTrainings - block.used}</b>
            </Text>
            <Text size="sm" color="dimmed" mb={4}>
              Цена за тренировку: <b>{block.pricePerTraining} ₽</b>
            </Text>
            <Badge
              color={block.active ? 'green' : 'gray'}
              style={{ marginTop: 8, fontSize: 14, padding: '6px 14px' }}
              size="lg"
              variant="light"
            >
              {block.active ? 'Активен' : 'Завершён'}
            </Badge>
          </Paper>
        )}
      </Container>
      {/* FIXED кнопка снизу */}
      <Box
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          background: 'rgba(255,255,255,0.85)',
          zIndex: 500,
          padding: 16,
          boxShadow: '0 -2px 16px 0 rgba(0,0,0,0.06)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '13px 0',
            color: '#d6336c',
            fontWeight: 600,
            fontSize: 18,
            background: 'transparent',
            border: '1.5px solid #d6336c',
            borderRadius: 12,
            transition: 'background 0.15s',
            cursor: 'pointer',
          }}
          onMouseOver={e =>
            (e.currentTarget.style.background = '#ffe3ed')
          }
          onMouseOut={e =>
            (e.currentTarget.style.background = 'transparent')
          }
        >
          <IconArrowBack size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Назад к тренировкам
        </button>
      </Box>
    </Box>
  );
}
