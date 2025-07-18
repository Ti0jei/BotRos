import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isToday from "dayjs/plugin/isToday";
import {
  Container,
  Divider,
  ScrollArea,
  Stack,
  Text,
  Title,
  Box,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

import { getToken } from "@/utils/auth";
import ScheduleHeader from "./ScheduleHeader";
import TrainingHourBlock from "./TrainingHourBlock";
import ConfirmModal from "./ConfirmModal";
import AssignModalFromCalendar from "./AssignModalFromCalendar";
import BackToProfileButton from "@/components/BackToProfileButton";
import { User, Training, PaymentBlock } from "./types";

dayjs.extend(isSameOrBefore);
dayjs.extend(isToday);

export default function AdminSchedule({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState<Dayjs>(() => {
    const stored = localStorage.getItem("calendarSelectedDate");
    return stored ? dayjs(stored) : dayjs().startOf("day");
  });

  const [clients, setClients] = useState<User[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [blocks, setBlocks] = useState<Record<string, PaymentBlock | null>>({});
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const [singlePrice, setSinglePrice] = useState<string>("");
  const [singlePaymentMethod, setSinglePaymentMethod] = useState<string>("");

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

  const handleDateChange = (d: Dayjs) => {
    setDate(d);
    localStorage.setItem("calendarSelectedDate", d.format("YYYY-MM-DD"));
  };

  return (
    <Box
      style={{
        backgroundColor: "#f7f7f7",
        minHeight: "100vh",
        paddingBottom: 80,
      }}
    >
      <Container size="xs" py="md">
        <ScheduleHeader date={date} setDate={handleDateChange} />

        <Title order={3} mt="md" mb="xs" c="#1a1a1a">
          Расписание
        </Title>

        <Text size="sm" c="dimmed" mb="xs">
          День: {date.format("DD.MM.YYYY")}
          {date.isToday() && (
            <Text span c="green">
              {" "}
              (сегодня)
            </Text>
          )}
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

      <BackToProfileButton onBack={onBack} fixed />

      <AssignModalFromCalendar
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedHour(null);
          onBack();
        }}
        clients={clients}
        blocks={blocks}
        selectedHour={selectedHour}
        selectedDate={date} // ✅ передаём Dayjs, не .format!
        onSuccess={loadTrainings}
        singlePrice={singlePrice}
        setSinglePrice={setSinglePrice}
        singlePaymentMethod={singlePaymentMethod}
        setSinglePaymentMethod={setSinglePaymentMethod}
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
