import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Title,
  Paper,
  Text,
  Badge,
  Group,
  Button,
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlock();
  }, []);

  return (
    <Box style={{ backgroundColor: '#f5d4ca', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={3} mb="md" style={{ color: '#222' }}>
          📦 Блок тренировок
        </Title>

        {loading ? (
          <Text>Загрузка...</Text>
        ) : !block ? (
          <Text color="red">У вас нет активного блока.</Text>
        ) : (
          <Paper withBorder p="md" radius="md" shadow="sm" style={{ backgroundColor: 'white' }}>
            <Group position="apart" mb="xs">
              <Text fw={600}>Дата оплаты</Text>
              <Text>{new Date(block.paidAt).toLocaleDateString()}</Text>
            </Group>
            <Text size="sm" color="dimmed" mb={4}>
              Всего тренировок: {block.paidTrainings}
            </Text>
            <Text size="sm" color="dimmed" mb={4}>
              Использовано: {block.used}
            </Text>
            <Text size="sm" color="dimmed" mb={4}>
              Осталось: {block.paidTrainings - block.used}
            </Text>
            <Text size="sm" color="dimmed" mb={4}>
              Цена за тренировку: {block.pricePerTraining} ₽
            </Text>
            <Badge color={block.active ? 'green' : 'gray'}>
              {block.active ? 'Активен' : 'Завершён'}
            </Badge>
          </Paper>
        )}

        <Box mt="md" ta="center">
          <Button
            variant="subtle"
            color="pink"
            onClick={onBack}
            leftIcon={<IconArrowBack size={14} />}
            styles={{
              root: {
                color: '#d6336c',
                border: '1px solid #d6336c',
                borderRadius: 8,
                fontWeight: 500,
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: '#ffe3ed' },
              },
            }}
          >
            Назад к тренировкам
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
