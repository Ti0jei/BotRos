import {
  Container,
  Title,
  Select,
  Paper,
  Grid,
  Group,
  Button,
  Modal,
  ScrollArea,
  Badge,
  Text,
  Checkbox,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

import { getToken } from '../utils/auth';
import {
  IconCheck,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';

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

export default function AdminSchedule() {
  const [date, setDate] = useState(() => dayjs().startOf('day'));
  const [clients, setClients] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
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

    // 🔒 Проверка: если не выбрана "Разовая оплата", то у пользователя должен быть активный блок
    if (!isSinglePaid) {
      const res = await fetch(`${API}/api/payment-blocks/user/${selectedUser}/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const block = res.ok ? await res.json() : null;
      if (!block) {
        alert('У клиента нет активного блока. Включите "Разовая оплата", чтобы назначить тренировку.');
        return;
      }
    }

    const trainingDate = date.format('YYYY-MM-DD');

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

  const handleAttendance = (id: string, attended: boolean, current: boolean | null) => {
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

  return (
    <Container>
      <Title order={2} mb="md">
        Расписание на {date.format('DD.MM.YYYY')}
      </Title>

      <Group mb="md">
        <Button variant="default" onClick={() => setDate(date.subtract(1, 'day'))}>
          ← Назад
        </Button>

        <div style={{ maxWidth: 220 }}>
          <DatePickerInput
            value={date.toDate()}
            onChange={(val) => val && setDate(dayjs(val))}
            clearable={false}
            dropdownType="popover"
            nextIcon={<IconChevronRight size={16} />}
            previousIcon={<IconChevronLeft size={16} />}
            popoverProps={{ withinPortal: true, shadow: 'md', radius: 'md' }}
            styles={{
              dropdown: { maxWidth: 280 },
              calendarHeaderControl: { fontSize: 14 },
            }}
          />
        </div>

        <Button variant="default" onClick={() => setDate(date.add(1, 'day'))}>
          Вперёд →
        </Button>
      </Group>

      <ScrollArea>
        <Grid>
          {hours.map((hour) => {
            const hourTrainings = getTrainingsAt(hour);
            return (
              <Grid.Col span={12} key={hour}>
                <Group position="apart" mb="xs">
                  <Title order={4}>{hour}:00</Title>
                  <Button size="xs" onClick={() => {
                    setSelectedHour(hour);
                    setModalOpen(true);
                  }}>
                    Назначить
                  </Button>
                </Group>

                {hourTrainings.map((training) => (
                  <Paper key={training.id} withBorder shadow="xs" p="sm" mb="xs" radius="md" bg="gray.1">
                    <Group position="apart" mb="xs">
                      <Text fw={500}>
                        {training.user.name} {training.user.lastName ?? ''} {training.user.internalTag ? `(${training.user.internalTag})` : ''}
                        {training.isSinglePaid && <span title="Разовая оплата"> 💸</span>}
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
                            onClick={() => handleAttendance(training.id, true, training.attended)}
                            style={{ minWidth: 80 }}
                          >
                            Был
                          </Button>

                          <Button
                            size="xs"
                            color="red"
                            variant={training.attended === false ? 'filled' : 'light'}
                            onClick={() => handleAttendance(training.id, false, training.attended)}
                            style={{ minWidth: 80 }}
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
                        style={{ minWidth: 80 }}
                      >
                        Отмена
                      </Button>
                    </Group>
                  </Paper>
                ))}
              </Grid.Col>
            );
          })}
        </Grid>
      </ScrollArea>

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
