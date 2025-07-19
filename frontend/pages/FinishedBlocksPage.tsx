// frontend/pages/FinishedBlocksPage.tsx

import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Text,
  Badge,
  Stack,
  Collapse,
  ActionIcon,
  Title,
  Loader,
  Box,
  Button,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconArrowLeft } from '@tabler/icons-react';

interface PaymentBlock {
  id: string;
  paidAt: string;
  paidTrainings: number;
  used: number;
  pricePerTraining: number;
  active: boolean;
}

interface TrainingRecord {
  id: string;
  date: string;
  hour: number;
  blockId?: string;
}

export default function FinishedBlocksPage({
  userId,
  onBack,
}: {
  userId: string;
  onBack: () => void;
}) {
  const [blocks, setBlocks] = useState<PaymentBlock[]>([]);
  const [blockTrainings, setBlockTrainings] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [blocksRes, trainingsRes] = await Promise.all([
        fetch(`${API}/api/payment-blocks?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/trainings?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allBlocks: PaymentBlock[] = await blocksRes.json();
      const finished = allBlocks.filter((b) => b.active === false);
      setBlocks(finished);

      const allTrainings: TrainingRecord[] = await trainingsRes.json();
      setBlockTrainings(allTrainings.filter((t) => t.blockId));
    } catch (e) {
      console.error('Ошибка загрузки:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (blockId: string) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  };

  return (
    <Box style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Group position="apart" mb="md">
          <Title order={3} c="#1a1a1a">
            Завершённые абонементы
          </Title>
        </Group>

        {loading ? (
          <Loader />
        ) : (
          <Stack spacing="md">
            {blocks.length === 0 && (
              <Text size="sm" c="dimmed">
                Нет завершённых абонементов
              </Text>
            )}

            {blocks.map((block) => {
              const usedTrainings = blockTrainings.filter((t) => t.blockId === block.id);
              const expanded = expandedBlocks[block.id] ?? false;

              return (
                <Paper key={block.id} style={cardStyle} withBorder>
                  <Group position="apart" mb="xs">
                    <Text fw={600} size="sm">
                      Оплата от {new Date(block.paidAt).toLocaleDateString()}
                    </Text>
                    <Badge color="gray">ЗАВЕРШЁН</Badge>
                  </Group>

                  <Group position="apart" align="center">
                    <Text size="sm" c="dimmed">
                      {block.paidTrainings} тренировок • {block.used} использовано • {block.pricePerTraining} ₽
                    </Text>

                    <ActionIcon
                      variant="light"
                      color="dark"
                      radius="xl"
                      onClick={() => toggleExpand(block.id)}
                    >
                      {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </ActionIcon>
                  </Group>

                  <Collapse in={expanded}>
                    <Stack spacing={4} mt="xs">
                      {usedTrainings.length > 0 ? (
                        usedTrainings.map((t) => (
                          <Text key={t.id} size="xs" c="dimmed">
                            {new Date(t.date).toLocaleDateString()} — {t.hour}:00
                          </Text>
                        ))
                      ) : (
                        <Text size="xs" c="dimmed">
                          Пока нет посещений
                        </Text>
                      )}
                    </Stack>
                  </Collapse>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* Фиксированная кнопка "Назад" */}
      <Box
        component="footer"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'white',
          padding: '12px 16px',
          borderTop: '1px solid #eee',
          zIndex: 1000,
        }}
      >
        <Box style={{ maxWidth: 420, margin: '0 auto' }}>
          <Button
            fullWidth
            size="md"
            variant="outline"
            color="black"
            onClick={onBack}
            leftIcon={<IconArrowLeft size={16} />}
            styles={{
              root: {
                color: '#000',
                border: '1px solid #000',
                borderRadius: 12,
                fontWeight: 500,
                backgroundColor: '#fff',
                transition: 'background 0.2s',
                '&:hover': { backgroundColor: '#f2f2f2' },
              },
            }}
          >
            Назад
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
