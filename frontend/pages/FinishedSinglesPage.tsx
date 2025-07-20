// frontend/pages/FinishedSinglesPage.tsx

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Title,
  Stack,
  Text,
  Paper,
  Group,
  Collapse,
  ActionIcon,
  Loader,
  Button,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconArrowLeft } from '@tabler/icons-react';

interface TrainingRecord {
  id: string;
  date: string;
  hour: number;
  isSinglePaid: boolean;
  attended?: boolean;
}

export default function FinishedSinglesPage({ onBack }: { onBack: () => void }) {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API}/api/trainings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: TrainingRecord[]) => {
        const singles = data.filter((t) => t.isSinglePaid && t.attended);
        setTrainings(singles);
      })
      .finally(() => setLoading(false));
  }, []);

  const groupByMonth = (items: TrainingRecord[]) => {
    const groups: Record<string, TrainingRecord[]> = {};
    for (const t of items) {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return groups;
  };

  const grouped = groupByMonth(trainings);

  const formatMonth = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  };

  return (
    <Box style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={3} c="#1a1a1a" mb="md">
          Завершённые разовые посещения
        </Title>

        {loading ? (
          <Loader />
        ) : (
          <Stack spacing="md">
            {Object.keys(grouped).length === 0 && (
              <Text size="sm" c="dimmed">
                Нет завершённых посещений
              </Text>
            )}

            {Object.entries(grouped).map(([monthKey, visits]) => {
              const isOpen = expanded[monthKey] ?? false;

              return (
                <Paper key={monthKey} shadow="xs" radius="md" p="md" withBorder>
                  <Group position="apart" mb="sm" noWrap>
                    <Text fw={600}>{formatMonth(monthKey)}</Text>
                    <ActionIcon
                      variant="default"
                      color="dark"
                      radius="xl"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [monthKey]: !prev[monthKey],
                        }))
                      }
                    >
                      {isOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                    </ActionIcon>
                  </Group>

                  <Collapse in={isOpen}>
                    <Stack spacing={4}>
                      {visits.map((v) => (
                        <Text key={v.id} size="sm" c="dimmed">
                          {new Date(v.date).toLocaleDateString()} — {v.hour}:00
                        </Text>
                      ))}
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
