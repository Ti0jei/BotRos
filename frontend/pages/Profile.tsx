import { useEffect, useState } from "react";
import {
  IconBellRinging,
  IconBellOff,
  IconLogout,
  IconMenu2,
  IconPencil,
  IconRepeat,
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
  Drawer,
  Button,
  Divider,
  TextInput,
  NumberInput,
  Image,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";

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
  const [drawerOpened, setDrawerOpened] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState(0);
  const [saving, setSaving] = useState(false);

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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ name: editName, age: editAge }),
      });

      if (!res.ok) throw new Error("Ошибка");

      showNotification({
        title: "Профиль обновлён",
        message: "",
        color: "green",
      });

      setUser((prev) =>
        prev ? { ...prev, name: editName, age: editAge } : prev
      );
      setEditMode(false);
      setDrawerOpened(false);
    } catch {
      showNotification({
        title: "Не удалось сохранить",
        message: "Попробуйте позже",
        color: "red",
      });
    } finally {
      setSaving(false);
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
    <>
      <Center
        style={{
          minHeight: "100vh",
          backgroundColor: "#f7f7f7",
          paddingTop: "1.5rem",
          paddingBottom: "2rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        <Card
          withBorder
          radius="xl"
          p="xl"
          shadow="xs"
          style={{ width: "100%", maxWidth: 420, position: "relative" }}
        >
          {/* 🔔 Notifications */}
          <ActionIcon
            size="lg"
            onClick={toggleNotifications}
            title={user.notificationsMuted ? "Оповещения выключены" : "Оповещения включены"}
            style={{
              position: "absolute",
              top: 16,
              right: 56,
              background: "transparent",
              color: "#000",
            }}
          >
            {user.notificationsMuted ? <IconBellOff size={20} /> : <IconBellRinging size={20} />}
          </ActionIcon>

          {/* ☰ Menu */}
          <ActionIcon
            size="lg"
            onClick={() => setDrawerOpened(true)}
            title="Меню"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "transparent",
              color: "#000",
            }}
          >
            <IconMenu2 size={24} />
          </ActionIcon>

          <Stack spacing="lg" pt={40}>
            <div>
              <Title order={3} c="#1a1a1a">
                Привет, {user.name}
              </Title>
              <Text size="sm" c="dimmed">
                Вы вошли как {user.email}
              </Text>
            </div>

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

            {/* 🔻 Логотип Krissfit */}
            <Stack spacing={4} align="center" mt="sm" pt="xs">
              <Image
                src="/logo-krissfit.png"
                alt="@Krissfit"
                width={70}
                height={70}
                fit="contain"
                style={{ opacity: 0.7 }}
              />
            </Stack>
          </Stack>
        </Card>
      </Center>

      <Drawer
        opened={drawerOpened}
        onClose={() => {
          setDrawerOpened(false);
          setEditMode(false);
        }}
        title={editMode ? "Изменить профиль" : "Меню"}
        padding="md"
        position="right"
        size="xs"
        radius="md"
      >
        <Stack spacing="md">
          {editMode ? (
            <>
              <TextInput
                label="Имя"
                value={editName}
                onChange={(e) => setEditName(e.currentTarget.value)}
                required
              />
              <NumberInput
                label="Возраст"
                value={editAge}
                onChange={(val) => setEditAge(typeof val === "number" ? val : 0)}
              />
              <Group position="right" mt="sm">
                <Button variant="default" onClick={() => setEditMode(false)}>
                  Отмена
                </Button>
                <Button
                  variant="outline"
                  color="dark"
                  loading={saving}
                  onClick={handleSaveProfile}
                >
                  Сохранить
                </Button>
              </Group>
            </>
          ) : (
            <>
              <Button
                variant="light"
                color="dark"
                leftIcon={<IconRepeat size={16} />}
                onClick={handleLogout}
              >
                Сменить профиль
              </Button>

              <Button
                variant="light"
                color="dark"
                leftIcon={<IconPencil size={16} />}
                onClick={() => {
                  setEditName(user.name);
                  setEditAge(user.age);
                  setEditMode(true);
                }}
              >
                Изменить профиль
              </Button>

              <Divider />
              <Text size="sm" c="dimmed">
                ➕ Скоро появятся новые опции
              </Text>
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
