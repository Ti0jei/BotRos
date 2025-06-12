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
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

import { getToken } from '../utils/auth';
import { IconCheck, IconTrash, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface User {
  id: string;
  name: string;
}

interface Training {
  id: string;
  userId: string;
  date: string;
  hour: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  attended: boolean | null;
  user: { name: string };
}

export default function AdminSchedule() {
  const [date, setDate] = useState(() => dayjs().startOf('day'));
  const [clients, setClients] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const markAttendance = async (id: string, attended: boolean) => {
    await fetch(`${API}/api/trainings/${id}/attended`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attended }),
    });

    await loadTrainings();
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
            popoverProps={{
              withinPortal: true,
              shadow: 'md',
              radius: 'md',
            }}
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
                <Paper withBorder p="sm" shadow="xs">
                  <Group position="apart">
                    <Text weight={500}>{hour}:00</Text>
                    <Button
                      size="xs"
                      onClick={() => {
                        setSelectedHour(hour);
                        setModalOpen(true);
                      }}
                    >
                      Назначить
                    </Button>
                  </Group>

                  {hourTrainings.map((training) => (
                    <Group key={training.id} spacing="xs" mt="xs">
                      <Text>{training.user.name}</Text>
                      <Badge
                        color={
                          training.status === 'CONFIRMED'
                            ? 'green'
                            : training.status === 'DECLINED'
                            ? 'red'
                            : 'gray'
                        }
                      >
                        {training.status}
                      </Badge>

                      {dayjs(training.date).isSameOrBefore(dayjs(), 'day') ? (
                        <>
                          <Button
                            size="xs"
                            variant={training.attended === true ? 'filled' : 'light'}
                            color="green"
                            onClick={() => markAttendance(training.id, true)}
                          >
                            Был
                          </Button>
                          <Button
                            size="xs"
                            variant={training.attended === false ? 'filled' : 'light'}
                            color="red"
                            onClick={() => markAttendance(training.id, false)}
                          >
                            Не был
                          </Button>
                        </>
                      ) : null}

                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => deleteTraining(training.id)}
                      >
                        Отменить
                      </Button>
                    </Group>
                  ))}
                </Paper>
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
          data={clients.map((c) => ({ value: c.id, label: c.name }))}
          value={selectedUser}
          onChange={setSelectedUser}
        />

        <Button mt="md" fullWidth onClick={assignTraining}>
          Назначить
        </Button>
      </Modal>
    </Container>
  );
}
