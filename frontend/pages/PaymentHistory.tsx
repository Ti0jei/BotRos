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
  Collapse,
  ActionIcon,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

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

interface TrainingRecord {
  id: string;
  date: string;
  hour: number;
  isSinglePaid: boolean;
  blockId?: string; // 🟢 исправлено здесь
}

export default function PaymentHistory({ userId, onBack }: Props) {
  const [blocks, setBlocks] = useState<PaymentBlock[]>([]);
  const [blockTrainings, setBlockTrainings] = useState<TrainingRecord[]>([]);
  const [singleTrainings, setSingleTrainings] = useState<TrainingRecord[]>([]);
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
        fetch(`${API}/api/payment-blocks/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/trainings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (blocksRes.ok) {
        const blockData = await blocksRes.json();
        setBlocks(blockData);
      }

      if (trainingsRes.ok) {
        const all: TrainingRecord[] = await trainingsRes.json();
        setBlockTrainings(all.filter((t) => t.blockId)); // 🟢 исправлено здесь
        setSingleTrainings(all.filter((t) => !t.blockId)); // 🟢 исправлено здесь
      }
    } catch (e) {
      console.error('Ошибка загрузки истории оплат:', e);
    } finally {
      setLoading(false);
    }
  };

  const markInactive = async (blockId: string) => {
    const confirmed = window.confirm('Завершить этот блок?');
    if (!confirmed) return;

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

  const buttonStyle = {
    root: {
      color: '#1a1a1a',
      border: '1px solid #1a1a1a',
      borderRadius: 12,
      fontWeight: 500,
      backgroundColor: '#fff',
      paddingLeft: 16,
      paddingRight: 16,
      minWidth: 120,
      transition: 'background 0.2s',
      '&:hover': { backgroundColor: '#f2f2f2' },
    },
  };

  return (
    <Box style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={3} mb="md" c="#1a1a1a">
          История оплат
        </Title>

        {loading ? (
          <Loader />
        ) : (
          <Stack spacing="md">
            {blocks.length === 0 && singleTrainings.length === 0 && (
              <Text size="sm" c="dimmed">
                Пока нет данных об оплатах
              </Text>
            )}

            {blocks.map((block) => {
              const usedTrainings = blockTrainings.filter(
                (t) => t.blockId === block.id // 🟢 исправлено здесь
              );
              const expanded = expandedBlocks[block.id] ?? false;

              return (
                <Paper key={block.id} style={cardStyle}>
                  <Group position="apart" mb="xs">
                    <Text fw={600} size="sm">
                      Оплата от {new Date(block.paidAt).toLocaleDateString()}
                    </Text>
                    <Badge color={block.active ? 'green' : 'gray'}>
                      {block.active ? 'АКТИВЕН' : 'ЗАВЕРШЁН'}
                    </Badge>
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

                  {block.active && (
                    <Button
                      size="xs"
                      color="red"
                      fullWidth
                      mt="sm"
                      onClick={() => markInactive(block.id)}
                      radius="md"
                    >
                      Завершить блок
                    </Button>
                  )}
                </Paper>
              );
            })}

            {singleTrainings.length > 0 && (
              <>
                <Divider label="Разовые тренировки" labelPosition="center" />
                <Stack spacing="xs">
                  {singleTrainings.map((t) => (
                    <Paper key={t.id} style={cardStyle} p="sm">
                      <Group position="apart">
                        <Text size="sm">{new Date(t.date).toLocaleDateString()}</Text>
                        <Text size="sm" c="dimmed">{t.hour}:00</Text>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        )}
      </Container>

      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "white",
          padding: "10px 16px",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
          zIndex: 1000,
        }}
      >
        <Box style={{ maxWidth: 420, margin: "0 auto" }}>
          <Button
            onClick={onBack}
            variant="outline"
            fullWidth
            styles={buttonStyle}
            leftIcon={<span style={{ fontSize: 16 }}>←</span>}
          >
            Назад к профилю
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
