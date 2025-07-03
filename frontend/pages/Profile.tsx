import { useEffect, useState } from "react";
import {
  IconBellRinging,
  IconBellOff,
  IconLogout,
} from "@tabler/icons-react";
import {
  Card,
  Center,
  Stack,
  Title,
  Text,
  Loader,
  Group,
  ActionIcon,
} from "@mantine/core";

import ClientSchedule from "./ClientSchedule";
import ClientNutrition from "./ClientNutrition";
import ClientBlock from "./ClientBlock";

import ActionButton from "@/components/ui/ActionButton";

interface User {
  name: string;
  lastName?: string | null;
  email: string;
  age: number;
  role: "USER" | "ADMIN";
  id: string;
  notificationsMuted?: boolean;
}

export default function Profile({
  onLogout,
  onOpenAdmin,
}: {
  onLogout: () => void;
  onOpenAdmin: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<"main" | "trainings" | "nutrition">("main");
  const [showBlock, setShowBlock] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (!token) {
      onLogout();
      return;
    }

    fetch(`${API}/api/profile`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          fetch(`${API}/api/notifications`, { headers })
            .then((res) => res.json())
            .then((notif) => {
              if (notif?.muted !== undefined) {
                setUser((prev) =>
                  prev ? { ...prev, notificationsMuted: notif.muted } : prev
                );
              }
            });
        } else {
          throw new Error("Profile not found");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        onLogout();
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  const toggleNotifications = async () => {
    if (!user) return;
    const newStatus = !user.notificationsMuted;

    try {
      await fetch(`${API}/api/notifications`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ muted: newStatus }),
      });
      setUser({ ...user, notificationsMuted: newStatus });
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="md" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="100vh">
        <Text c="red" size="sm">
          Не удалось загрузить профиль
        </Text>
      </Center>
    );
  }

  if (section === "trainings") {
    return showBlock ? (
      <ClientBlock
        onBack={() => setShowBlock(false)}
        onToProfile={() => setSection("main")}
      />
    ) : (
      <ClientSchedule
        onBack={() => setSection("main")}
        onOpenBlock={() => setShowBlock(true)}
      />
    );
  }

  if (section === "nutrition") {
    return (
      <ClientNutrition userId={user.id} onBack={() => setSection("main")} />
    );
  }

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
          {/* Заголовок и уведомления */}
          <Group position="apart">
            <div>
              <Title order={3} c="#1a1a1a">
                Привет, {user.name} 👋
              </Title>
              <Text size="sm" c="dimmed">
                Вы вошли как {user.email}
              </Text>
            </div>

            <ActionIcon
              variant="light"
              size="lg"
              onClick={toggleNotifications}
              title={
                user.notificationsMuted
                  ? "Оповещения выключены"
                  : "Оповещения включены"
              }
            >
              {user.notificationsMuted ? (
                <IconBellOff size={20} />
              ) : (
                <IconBellRinging size={20} />
              )}
            </ActionIcon>
          </Group>

          {/* Кнопки */}
          <Stack spacing="sm">
            <ActionButton
              fullWidth
              variant="filled"
              colorStyle="black"
              onClick={() => setSection("trainings")}
            >
              Мои тренировки
            </ActionButton>

            <ActionButton
              fullWidth
              variant="filled"
              colorStyle="black"
              onClick={() => setSection("nutrition")}
            >
              Моё питание
            </ActionButton>

            <ActionButton fullWidth variant="outline" disabled>
              Замеры (скоро)
            </ActionButton>

            <ActionButton fullWidth variant="outline" disabled>
              Фото (скоро)
            </ActionButton>

            <ActionButton fullWidth variant="outline" disabled>
              Материалы (скоро)
            </ActionButton>

            {user.role === "ADMIN" && (
              <ActionButton
                fullWidth
                variant="outline"
                colorStyle="black"
                onClick={onOpenAdmin}
              >
                Панель тренера
              </ActionButton>
            )}
          </Stack>

          <ActionButton
            fullWidth
            variant="outline"
            colorStyle="black"
            onClick={handleLogout}
            leftIcon={<IconLogout size={18} />}
          >
            Выйти
          </ActionButton>
        </Stack>
      </Card>
    </Center>
  );
}
