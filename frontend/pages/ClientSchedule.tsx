import { useEffect, useState } from "react";
import {
  IconArrowBack,
  IconPackage,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  Card,
  Center,
  Stack,
  Title,
  Text,
  Group,
  Loader,
  Divider,
} from "@mantine/core";

import ActionButton from "@/components/ui/ActionButton";
import StatusBadge from "@/components/ui/StatusBadge";

interface Training {
  id: string;
  date: string;
  hour: number;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
}

export default function ClientSchedule({
  onBack,
  onOpenBlock,
}: {
  onBack: () => void;
  onOpenBlock: () => void;
}) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadTrainings = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/trainings`, { headers });
    if (res.ok) {
      const data = await res.json();
      const upcoming = data
        .filter((t: Training) =>
          dayjs(t.date).add(t.hour, "hour").isAfter(dayjs())
        )
        .sort((a, b) => {
          const aTime = dayjs(a.date).add(a.hour, "hour");
          const bTime = dayjs(b.date).add(b.hour, "hour");
          return aTime.diff(bTime);
        });
      setTrainings(upcoming);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "CONFIRMED" | "DECLINED") => {
    await fetch(`${API}/api/trainings/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    setEditingId(null);
    loadTrainings();
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const getStatusBadge = (status: Training["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return <StatusBadge status="active">Подтверждено</StatusBadge>;
      case "DECLINED":
        return <StatusBadge status="declined">Отменено</StatusBadge>;
      default:
        return <StatusBadge status="pending">Ожидание</StatusBadge>;
    }
  };

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
          <Group position="apart" align="flex-start">
            <div>
              <Title order={3} c="#1a1a1a">
                🏋️‍♂️ Мои тренировки
              </Title>
              <Text size="sm" c="dimmed">
                Расписание ваших занятий
              </Text>
            </div>

            <ActionButton
              size="sm"
              variant="outline"
              colorStyle="black"
              leftIcon={<IconPackage size={14} />}
              onClick={onOpenBlock}
              style={{ marginTop: 2 }}
            >
              Абонемент
            </ActionButton>
          </Group>

          {loading ? (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          ) : trainings.length === 0 ? (
            <Stack spacing="xs" align="center">
              <Text size="sm" align="center" c="dimmed">
                У вас пока нет запланированных тренировок
              </Text>
              <Text size="xs" align="center" c="dimmed">
                Если у вас есть абонемент — тренер добавит тренировки скоро.
              </Text>
            </Stack>
          ) : (
            <Stack spacing="sm">
              {trainings.map((t) => (
                <Card key={t.id} withBorder radius="md" p="md" shadow="xs">
                  <Stack spacing={6}>
                    <Group position="apart">
                      <Text fw={500}>
                        {dayjs(t.date).format("DD.MM.YYYY")} в {t.hour}:00
                      </Text>
                      {getStatusBadge(t.status)}
                    </Group>

                    {t.status === "PENDING" || editingId === t.id ? (
                      <Stack spacing={6}>
                        <ActionButton
                          fullWidth
                          onClick={() => updateStatus(t.id, "CONFIRMED")}
                          leftIcon={<IconCheck size={16} />}
                        >
                          Приду
                        </ActionButton>
                        <ActionButton
                          fullWidth
                          onClick={() => updateStatus(t.id, "DECLINED")}
                          leftIcon={<IconX size={16} />}
                          colorStyle="red"
                        >
                          Не приду
                        </ActionButton>
                      </Stack>
                    ) : (
                      <ActionButton
                        fullWidth
                        variant="light"
                        onClick={() => setEditingId(t.id)}
                      >
                        Изменить решение
                      </ActionButton>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}

          <Divider my="sm" />

          <ActionButton
            variant="outline"
            fullWidth
            leftIcon={<IconArrowBack size={16} />}
            onClick={onBack}
            colorStyle="black"
          >
            Назад
          </ActionButton>
        </Stack>
      </Card>
    </Center>
  );
}
