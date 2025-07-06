import { useEffect, useState } from "react";
import {
  IconAlarm,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconLogout,
  IconUser,
  IconPlus,
} from "@tabler/icons-react";
import {
  Box,
  Card,
  Center,
  Collapse,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  Badge,
} from "@mantine/core";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom"; // ✅ добавлено
import InviteCodeViewer from "@/components/InviteCodeViewer";
import { getToken } from "@/utils/auth";
import ActionButton from "@/components/ui/ActionButton";
import AssignModal from "@/components/AssignModal"; // ✅ добавлено

interface CoachProfileProps {
  profile: { name: string };
  onLogout: () => void;
  onOpenSchedule: () => void;
  onOpenClients?: () => void;
}

interface Training {
  id: string;
  hour: number;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  user: {
    id: string;
    name: string;
    lastName?: string | null;
    internalTag?: string | null;
  };
}

export default function CoachProfile({
  profile,
  onLogout,
  onOpenSchedule,
  onOpenClients,
}: CoachProfileProps) {
  const [upcomingTrainings, setUpcomingTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);

  const token = getToken();
  const API = import.meta.env.VITE_API_BASE_URL;

  // ✅ читаем параметры userId и singlePaid
  const [params] = useSearchParams();
  const preselectedUserId = params.get("userId");
  const preselectedSinglePaid = params.get("singlePaid") === "true";

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const today = dayjs().format("YYYY-MM-DD");
        const res = await fetch(`${API}/api/trainings?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const filtered = data
          .filter(
            (t: Training) =>
              (t.status === "PENDING" || t.status === "CONFIRMED") &&
              t.hour * 60 > currentMinutes
          )
          .sort((a, b) => a.hour - b.hour);

        const nextHour = filtered[0]?.hour;
        setUpcomingTrainings(
          nextHour !== undefined
            ? filtered.filter((t) => t.hour === nextHour)
            : []
        );
      } catch (err) {
        console.error("Ошибка загрузки тренировок:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const sendReminder = async (trainingId: string) => {
    const res = await fetch(`${API}/api/notifications/remind/${trainingId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Не удалось отправить напоминание");
    } else {
      alert("Напоминание отправлено");
    }
  };

  const renderTrainingCard = (t: Training) => (
    <Card key={t.id} withBorder radius="md" p="md" shadow="xs">
      <Stack spacing="xs">
        <Group position="apart">
          <Text size="sm" fw={500}>
            {t.hour}:00 — {t.user.name} {t.user.lastName ?? ""}
            {t.user.internalTag && (
              <Text span c="dimmed">
                {" "}
                ({t.user.internalTag})
              </Text>
            )}
          </Text>
          <Badge
            size="sm"
            color={t.status === "CONFIRMED" ? "green" : "orange"}
            variant="light"
          >
            {t.status === "CONFIRMED" ? "Подтверждено" : "Ожидание"}
          </Badge>
        </Group>

        {t.status === "PENDING" && (
          <ActionButton
            variant="outline"
            colorStyle="black"
            size="xs"
            onClick={() => sendReminder(t.id)}
          >
            Напомнить
          </ActionButton>
        )}
      </Stack>
    </Card>
  );

  return (
    <Center
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        padding: "2rem 1rem",
      }}
    >
      <Card
        withBorder
        radius="xl"
        p="xl"
        shadow="xs"
        style={{ width: "100%", maxWidth: 420 }}
      >
        <Stack spacing="lg">
          <Stack spacing={4}>
            <Title order={3}>👤 {profile.name}</Title>
            <Text size="sm" c="dimmed">
              Профиль администратора
            </Text>
          </Stack>

          <ActionButton
            variant="outline"
            colorStyle="black"
            fullWidth
            leftIcon={<IconUser size={16} />}
            onClick={onOpenClients}
          >
            Клиенты
          </ActionButton>

          <ActionButton
            variant="outline"
            colorStyle="black"
            fullWidth
            leftIcon={<IconPlus size={16} />}
            onClick={onOpenSchedule}
          >
            Назначить тренировку
          </ActionButton>

          <Divider />

          {loading ? (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          ) : upcomingTrainings.length > 0 ? (
            <>
              <Group spacing={6}>
                <IconAlarm size={16} />
                <Text size="sm" fw={500}>
                  Ближайшие тренировки
                </Text>
              </Group>

              <Stack spacing="sm">
                {upcomingTrainings.map((t) => renderTrainingCard(t))}
              </Stack>
            </>
          ) : (
            <Text size="sm" c="dimmed" align="center">
              Сегодня нет ближайших тренировок
            </Text>
          )}

          <Divider />

          <ActionButton
            fullWidth
            variant="outline"
            colorStyle="black"
            onClick={() => setShowCode((prev) => !prev)}
            rightIcon={
              showCode ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
            }
          >
            {showCode ? "Скрыть код" : "Показать код для регистрации"}
          </ActionButton>

          <Collapse in={showCode}>
            <Card withBorder radius="md" p="md" mt="sm">
              <InviteCodeViewer />
            </Card>
          </Collapse>

          <Divider />

          <ActionButton
            variant="outline"
            fullWidth
            leftIcon={<IconLogout size={16} />}
            colorStyle="black"
            onClick={onLogout}
          >
            Выйти
          </ActionButton>
        </Stack>
      </Card>

      {/* 👉 Вставить модалку назначения с выбранным клиентом, если надо */}
      {/* <AssignModal
        opened={...}
        onClose={...}
        clients={...}
        selectedUser={preselectedUserId}
        setSelectedUser={...}
        isSinglePaid={preselectedSinglePaid}
        setIsSinglePaid={...}
        selectedHour={...}
        blocks={...}
        onAssign={...}
      /> */}
    </Center>
  );
}
