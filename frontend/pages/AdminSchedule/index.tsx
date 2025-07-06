import { useEffect, useState } from "react";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isToday from "dayjs/plugin/isToday";
import {
  Container,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
  Box,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";

import { getToken } from "@/utils/auth";
import ScheduleHeader from "./ScheduleHeader";
import TrainingHourBlock from "./TrainingHourBlock";
import AssignModal from "./AssignModal";
import ConfirmModal from "./ConfirmModal";
import BackButtonFixed from "./BackButtonFixed";
import { User, Training, PaymentBlock } from "./types";

dayjs.extend(isSameOrBefore);
dayjs.extend(isToday);

export default function AdminSchedule({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState(() => dayjs().startOf("day"));
  const [clients, setClients] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [blocks, setBlocks] = useState<Record<string, PaymentBlock | null>>({});
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isSinglePaid, setIsSinglePaid] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");

  const token = getToken();
  const API = import.meta.env.VITE_API_BASE_URL;
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);

  const loadClients = async () => {
    const res = await fetch(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setClients(data);

    for (const client of data) {
      const bRes = await fetch(
        `${API}/api/payment-blocks/user/${client.id}/active`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bData = bRes.ok ? await bRes.json() : null;
      setBlocks((prev) => ({ ...prev, [client.id]: bData }));
    }
  };

  const loadTrainings = async () => {
    const res = await fetch(
      `${API}/api/trainings?date=${date.format("YYYY-MM-DD")}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setTrainings(data);
  };

  const assignTraining = async () => {
    if (!selectedUser || selectedHour === null) return;

    const trainingDate = date.format("YYYY-MM-DD");
    const block = blocks[selectedUser];
    const hasBlock = block && block.paidTrainings > block.used;

    if (!hasBlock && !isSinglePaid) {
      showNotification({
        title: "Нет активного блока",
        message:
          'У клиента нет активного блока. Поставьте галочку "Разовая оплата"',
        color: "red",
      });
      return;
    }

    await fetch(`${API}/api/trainings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selectedUser,
        date: trainingDate,
        hour: selectedHour,
        isSinglePaid,
      }),
    });

    showNotification({
      title: "Успешно",
      message: "Тренировка назначена",
      color: "green",
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
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadTrainings();
  };

  const handleAttendance = (id: string, attended: boolean) => {
    setConfirmAction(() => async () => {
      await fetch(`${API}/api/trainings/${id}/attended`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attended }),
      });
      setConfirmModal(false);
      await loadTrainings();
    });

    setConfirmMessage(attended ? 'Отметить "Был"?' : 'Отметить "Прогул"?');
    setConfirmModal(true);
  };

  useEffect(() => {
    loadClients();
    loadTrainings();
  }, [date]);

  return (
    <Box
      style={{
        backgroundColor: "#f7f7f7",
        minHeight: "100vh",
        paddingBottom: 80,
      }}
    >
      <Container size="xs" py="md">
        <ScheduleHeader date={date} setDate={setDate} />

        <Title order={3} mt="md" mb="xs" c="#1a1a1a">
          Расписание
        </Title>

        <Text size="sm" c="dimmed" mb="xs">
          День: {date.format("DD.MM.YYYY")}
          {date.isToday() && <Text span c="green"> (сегодня)</Text>}
        </Text>

        <Divider mb="sm" />

        <ScrollArea h="60vh">
          <Stack spacing="sm">
            {hours.map((hour) => (
              <TrainingHourBlock
                key={hour}
                hour={hour}
                date={date}
                trainings={trainings.filter((t) => t.hour === hour)}
                blocks={blocks}
                onOpenAssign={() => {
                  setSelectedHour(hour);
                  setModalOpen(true);
                }}
                onDelete={deleteTraining}
                onAttend={handleAttendance}
              />
            ))}
          </Stack>
        </ScrollArea>
      </Container>

      <BackButtonFixed onClick={onBack} />

      <AssignModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onAssign={assignTraining}
        clients={clients}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        isSinglePaid={isSinglePaid}
        setIsSinglePaid={setIsSinglePaid}
        selectedHour={selectedHour}
        blocks={blocks}
      />

      <ConfirmModal
        opened={confirmModal}
        onClose={() => setConfirmModal(false)}
        message={confirmMessage}
        onConfirm={confirmAction}
      />
    </Box>
  );
}
