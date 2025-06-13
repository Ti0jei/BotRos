import {
  Container,
  Select,
  Paper,
  Group,
  Button,
  Modal,
  ScrollArea,
  Badge,
  Text,
  Checkbox,
  Divider,
  Stack,
  Box,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isToday from 'dayjs/plugin/isToday';
import {
  IconCheck,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import { getToken } from '../utils/auth';

dayjs.extend(isSameOrBefore);
dayjs.extend(isToday);

interface User {
  id: string;
  name: string;
  lastName?: string | null;
  internalTag?: string | null;
}

interface Training {
  id: string;
  userId: string;
  date: string;
  hour: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  attended: boolean | null;
  isSinglePaid: boolean;
  user: {
    name: string;
    lastName?: string | null;
    internalTag?: string | null;
  };
}

interface PaymentBlock {
  id: string;
  paidTrainings: number;
  used: number;
}

export default function AdminSchedule({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState(() => dayjs().startOf('day'));
  const [clients, setClients] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [blocks, setBlocks] = useState<Record<string, PaymentBlock | null>>({});
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isSinglePaid, setIsSinglePaid] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  const token = getToken();
  const API = import.meta.env.VITE_API_BASE_URL;

  const loadClients = async () => {
    const res = await fetch(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setClients(data);

    for (const client of data) {
      const bRes = await fetch(`${API}/api/payment-blocks/user/${client.id}/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bData = bRes.ok ? await bRes.json() : null;
      setBlocks(prev => ({ ...prev, [client.id]: bData }));
    }
  };

  const loadTrainings = async () => {
    const res = await fetch(`${API}/api/trainings?date=${date.format('YYYY-MM-DD')}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTrainings(data);
  };

  const assignTraining = async () => {
    if (!selectedUser || selectedHour === null) return;

    const trainingDate = date.format('YYYY-MM-DD');
    const hasBlock = !!blocks[selectedUser];

    if (!hasBlock && !isSinglePaid) {
      showNotification({
        title: 'Нет активного блока',
        message: 'У клиента нет активного блока. Поставьте галочку "Разовая оплата"',
        color: 'red',
      });
      return;
    }

    await fetch(`${API}/api/trainings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: selectedUser,
        date: trainingDate,
        hour: selectedHour,
        isSinglePaid,
      }),
    });

    showNotification({
      title: 'Успешно',
      message: 'Тренировка назначена',
      color: 'green',
      icon: <IconCheck />,
    });

    setModalOpen(false);
    setSelectedUser(null);
    setSelectedHour(null);
    setIsSinglePaid(false);
    await loadTrainings();
  };

  const deleteTraining = async (id: string) => {
    await fetch(`${API}/api/trainings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    showNotification({
      title: 'Удалено',
      message: 'Тренировка отменена',
      color: 'red',
      icon: <IconTrash />,
    });

    await loadTrainings();
  };

  const handleAttendance = (id: string, attended: boolean) => {
    setConfirmAction(() => async () => {
      await fetch(`${API}/api/trainings/${id}/attended`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attended }),
      });
      setConfirmModal(false);
      await loadTrainings();
    });

    setConfirmMessage(attended ? 'Отметить "Был"?' : 'Отметить "Прогул"?');
    setConfirmModal(true);
  };

  const hours = Array.from({ length: 15 }, (_, i) => i + 8);
  const getTrainingsAt = (hour: number) =>
    trainings.filter((t) => t.hour === hour);

  useEffect(() => {
    loadClients();
    loadTrainings();
  }, [date]);

  const getCardColor = (status: string) => {
    if (status === 'CONFIRMED') return '#e6ffec';
    if (status === 'DECLINED') return '#ffe6e6';
    return '#f1f3f5';
  };

  const getUserIcon = (training: Training) => {
    if (training.isSinglePaid) return '💸';
    if (!blocks[training.userId]) return '📛';
    return '🧍';
  };

  return (
    <Container size="sm" py="md">
      <Group position="center" spacing="xs" mb="md">
        <Button
          size="xs"
          variant="default"
          onClick={() => setDate(date.subtract(1, 'day'))}
          leftIcon={<IconChevronLeft size={14} />}
        >
          Назад
        </Button>

        <DatePickerInput
          value={date.toDate()}
          onChange={(val) => val && setDate(dayjs(val))}
          clearable={false}
          dropdownType="popover"
          size="xs"
          nextIcon={<IconChevronRight size={16} />}
          previousIcon={<IconChevronLeft size={16} />}
          popoverProps={{ withinPortal: true, shadow: 'md', radius: 'md' }}
          styles={{ input: { textAlign: 'center', minWidth: 120 } }}
        />

        <Button
          size="xs"
          variant="default"
          onClick={() => setDate(date.add(1, 'day'))}
          rightIcon={<IconChevronRight size={14} />}
        >
          Вперёд
        </Button>
      </Group>

      <Group position="center" mb="sm">
        <Text fw={700} size="lg">
          Расписание на {date.format('DD.MM.YYYY')}
          {date.isToday() && <Text span color="green"> (сегодня)</Text>}
        </Text>
      </Group>

      <Divider my="sm" />

      <ScrollArea h="65vh">
        <Stack spacing="sm">
          {hours.map((hour) => {
            const hourTrainings = getTrainingsAt(hour);
            const highlightHour = date.isToday() && hour === dayjs().hour();

            return (
              <Box key={hour} style={{ backgroundColor: highlightHour ? '#fffbe6' : 'transparent', borderRadius: 8, padding: 4 }}>
                <Group position="apart" mb={4} align="center">
                  <Text fw={600} size="md" style={{ minWidth: 60 }}>
                    {hour}:00
                  </Text>
                  <Group grow spacing="xs">
                    <Button
                      size="xs"
                      color="blue"
                      variant="light"
                      onClick={() => {
                        setSelectedHour(hour);
                        setModalOpen(true);
                      }}
                    >
                      Назначить
                    </Button>
                  </Group>
                </Group>

                {hourTrainings.map((training) => (
                  <Paper
                    key={training.id}
                    withBorder
                    shadow="xs"
                    radius="md"
                    p="sm"
                    mb="xs"
                    style={{ backgroundColor: getCardColor(training.status) }}
                  >
                    <Group position="apart" mb="xs">
                      <Text fw={500}>
                        {getUserIcon(training)} {training.user.name} {training.user.lastName ?? ''}{' '}
                        {training.user.internalTag && (
                          <Text span color="dimmed">
                            ({training.user.internalTag})
                          </Text>
                        )}
                      </Text>
                      <Badge color={
                        training.status === 'CONFIRMED'
                          ? 'green'
                          : training.status === 'DECLINED'
                            ? 'red'
                            : 'gray'
                      }>
                        {training.status === 'CONFIRMED' ? 'Придёт' :
                          training.status === 'DECLINED' ? 'Не придёт' : 'Ожидается'}
                      </Badge>
                    </Group>

                    <Group grow spacing="xs">
                      {dayjs(training.date).isSameOrBefore(dayjs(), 'day') && (
                        <>
                          <Button
                            size="xs"
                            color="green"
                            variant={training.attended === true ? 'filled' : 'light'}
                            onClick={() => handleAttendance(training.id, true)}
                          >
                            Был
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant={training.attended === false ? 'filled' : 'light'}
                            onClick={() => handleAttendance(training.id, false)}
                          >
                            Прогул
                          </Button>
                        </>
                      )}
                      <Button
                        size="xs"
                        color="gray"
                        variant="light"
                        onClick={() => deleteTraining(training.id)}
                      >
                        Отмена
                      </Button>
                    </Group>
                  </Paper>
                ))}
              </Box>
            );
          })}
        </Stack>
      </ScrollArea>

      <Group position="center" mt="md">
        <Button
          variant="subtle"
          color="blue"
          size="sm"
          onClick={onBack}
          leftIcon={<IconArrowLeft size={16} />}
        >
          Назад к профилю
        </Button>
      </Group>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Назначить тренировку на ${selectedHour}:00`}
      >
        <Select
          label="Клиент"
          placeholder="Выберите клиента"
          data={clients.map((c) => ({
            value: c.id,
            label: `${c.name} ${c.lastName ?? ''}${c.internalTag ? ` (${c.internalTag})` : ''}`,
          }))}
          value={selectedUser}
          onChange={setSelectedUser}
        />
        <Checkbox
          mt="md"
          label="Разовая оплата"
          checked={isSinglePaid}
          onChange={(event) => setIsSinglePaid(event.currentTarget.checked)}
        />
        <Button mt="md" fullWidth onClick={assignTraining}>
          Назначить
        </Button>
      </Modal>

      <Modal
        opened={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Подтверждение"
      >
        <Text mb="md">{confirmMessage}</Text>
        <Group grow>
          <Button color="gray" variant="light" onClick={() => setConfirmModal(false)}>
            Нет
          </Button>
          <Button color="green" onClick={() => confirmAction()}>
            Да
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
