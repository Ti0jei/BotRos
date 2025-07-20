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
  Drawer,
  ActionIcon,
  Accordion,
} from '@mantine/core';
import { IconMenu2 } from '@tabler/icons-react';
import dayjs from 'dayjs';

interface Props {
  userId: string;
  onBack: () => void;
  setView: (v: string) => void;
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
  attended?: boolean;
  blockId?: string;
}

export default function PaymentHistory({ userId, onBack, setView }: Props) {
  const [blocks, setBlocks] = useState<PaymentBlock[]>([]);
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpened, setDrawerOpened] = useState(false);

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
        setTrainings(all);
      }
    } catch (e) {
      console.error('Ошибка загрузки истории оплат:', e);
    } finally {
      setLoading(false);
    }
  };

  const today = dayjs();
  const activeBlock = blocks.find((b) => b.active);

  const pastTrainings = trainings
    .filter((t) => t.attended && dayjs(t.date).isBefore(today))
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    .slice(0, 3);

  const futureTrainings = trainings
    .filter((t) => dayjs(t.date).isAfter(today))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

  const trainingsForActiveBlock = activeBlock
    ? trainings
        .filter((t) => t.blockId === activeBlock.id && t.attended)
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    : [];

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
    <Box style={{ backgroundColor: '#f7f7f7', minHeight: '100vh', paddingBottom: 80, position: 'relative' }}>
      <ActionIcon
        size="lg"
        onClick={() => setDrawerOpened(true)}
        title="Меню"
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          background: 'transparent',
          color: '#1a1a1a',
          zIndex: 9999,
        }}
        variant="subtle"
      >
        <IconMenu2 size={20} />
      </ActionIcon>

      <Container size="xs" py="md">
        <Group position="apart" mb="md">
          <Title order={3} c="#1a1a1a">Запись</Title>
        </Group>

        {loading ? (
          <Loader />
        ) : (
          <Stack spacing="md">
            {activeBlock && (
              <Accordion variant="separated">
                <Accordion.Item value="block">
                  <Accordion.Control>
                    <Group position="apart" style={{ width: '100%' }}>
                      <div>
                        <Text fw={600} size="sm">
                          Оплата от {new Date(activeBlock.paidAt).toLocaleDateString()}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {activeBlock.paidTrainings} тренировок • {activeBlock.used} использовано • {activeBlock.pricePerTraining} ₽
                        </Text>
                      </div>
                      <Badge color="green">АКТИВЕН</Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack spacing="xs" mt="sm">
                      {trainingsForActiveBlock.length > 0 ? (
                        trainingsForActiveBlock.map((t) => (
                          <Paper key={t.id} style={cardStyle} p="sm">
                            <Group position="apart">
                              <Text size="sm">{new Date(t.date).toLocaleDateString()}</Text>
                              <Text size="sm" c="dimmed">{t.hour}:00</Text>
                            </Group>
                          </Paper>
                        ))
                      ) : (
                        <Text size="sm" c="dimmed">Нет использованных тренировок</Text>
                      )}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            )}

            {futureTrainings.length > 0 && (
              <>
                <Divider label="Будущие тренировки" labelPosition="center" />
                <Stack spacing="xs">
                  {futureTrainings.map((t) => (
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

            {pastTrainings.length > 0 && (
              <>
                <Divider label="Последние тренировки" labelPosition="center" />
                <Stack spacing="xs">
                  {pastTrainings.map((t) => (
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

      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="Опции"
        padding="md"
        position="right"
        size="xs"
        overlayOpacity={0.55}
        overlayBlur={3}
      >
        <Stack spacing="sm">
          <Button
            fullWidth
            variant="outline"
            styles={buttonStyle}
            onClick={() => {
              setDrawerOpened(false);
              setView('finished-blocks');
            }}
          >
            Завершённые абонементы
          </Button>
          <Button
            fullWidth
            variant="outline"
            styles={buttonStyle}
            onClick={() => {
              setDrawerOpened(false);
              setView('finished-singles');
            }}
          >
            Завершённые разовые посещения
          </Button>
        </Stack>
      </Drawer>

      <Box
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'white',
          padding: '10px 16px',
          boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
          zIndex: 1000,
        }}
      >
        <Box style={{ maxWidth: 420, margin: '0 auto' }}>
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
