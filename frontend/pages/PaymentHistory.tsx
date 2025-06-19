import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Badge,
  Group,
  Stack,
  Text,
  Button,
  Loader,
  Divider,
  Box,
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: false }),
      });
      await loadData();
    } catch (e) {
      console.error('Ошибка завершения блока:', e);
    }
  };

  return (
    <Box style={{ backgroundColor: '#e8b3a6', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={3} mb="md" style={{ color: '#222' }}>
          История оплат
        </Title>

        {loading ? (
          <Loader />
        ) : (
          <Stack spacing="md">
            {blocks.map((block) => (
              <Paper key={block.id} withBorder radius="md" p="md" shadow="sm">
                <Group position="apart" mb="xs">
                  <Text fw={600} size="sm">
                    Оплата от {new Date(block.paidAt).toLocaleDateString()}
                  </Text>
                  <Badge color={block.active ? 'green' : 'gray'}>
                    {block.active ? 'АКТИВЕН' : 'ЗАВЕРШЁН'}
                  </Badge>
                </Group>

                <Text size="sm" color="dimmed">
                  {block.paidTrainings} тренировок • {block.used} использовано • {block.pricePerTraining} ₽
                </Text>

                {block.active && (
                  <Button
                    size="xs"
                    color="red"
                    fullWidth
                    mt="sm"
                    onClick={() => markInactive(block.id)}
                  >
                    Завершить блок
                  </Button>
                )}
              </Paper>
            ))}

            {singleTrainings.length > 0 && (
              <>
                <Divider label="Разовые тренировки" labelPosition="center" />
                <Stack spacing="xs">
                  {singleTrainings.map((t) => (
                    <Paper key={t.id} withBorder radius="md" p="sm" shadow="xs">
                      <Group position="apart">
                        <Text size="sm">{new Date(t.date).toLocaleDateString()}</Text>
                        <Text size="sm" color="dimmed">{t.hour}:00</Text>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
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
            color="pink"
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
