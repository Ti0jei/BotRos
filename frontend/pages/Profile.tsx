import { useEffect, useState } from "react";
import {
  Center,
  Loader,
  ActionIcon,
  Tooltip,
  Stack,
  Title,
  Text,
} from "@mantine/core";
import { IconBell, IconBellOff, IconLogout } from "@tabler/icons-react";
import ClientSchedule from "./ClientSchedule";
import ClientNutrition from "./ClientNutrition";
import ClientBlock from "./ClientBlock";
import ActionButton from "@/components/ui/ActionButton"; // ✅ исправлено: убраны фигурные скобки

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
  const [section, setSection] = useState<
    "main" | "trainings" | "nutrition" | "measurements" | "photos"
  >("main");
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
      .catch((err) => {
        console.error("Ошибка:", err);
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
    } catch (err) {
      console.error("Ошибка обновления уведомлений:", err);
    }
  };

  if (loading) {
    return (
      <Center className="min-h-screen">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center className="min-h-screen">
        <Text color="red">Не удалось загрузить профиль</Text>
      </Center>
    );
  }

  return (
    <div className="bg-pink-50 min-h-screen flex justify-center items-start py-4 pb-20">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-md p-6 relative">
        {/* Иконка уведомлений */}
        {section === "main" && (
          <Tooltip
            label={
              user.notificationsMuted
                ? "Оповещения выключены"
                : "Оповещения включены"
            }
          >
            <ActionIcon
              variant="light"
              color={user.notificationsMuted ? "gray" : "pink"}
              onClick={toggleNotifications}
              radius="xl"
              size="lg"
              className="absolute top-4 right-4"
            >
              {user.notificationsMuted ? (
                <IconBellOff size={20} />
              ) : (
                <IconBell size={20} />
              )}
            </ActionIcon>
          </Tooltip>
        )}

        {section === "main" && (
          <Stack spacing="sm">
            <Title order={2} ta="center" className="font-bold mb-2">
              Привет, {user.name} 👋
            </Title>

            <ActionButton fullWidth onClick={() => setSection("trainings")}>
              Мои тренировки
            </ActionButton>

            <ActionButton fullWidth onClick={() => setSection("nutrition")}>
              Моё питание
            </ActionButton>

            <ActionButton fullWidth disabled>
              Замеры (скоро)
            </ActionButton>

            <ActionButton fullWidth disabled>
              Фото (скоро)
            </ActionButton>

            <ActionButton fullWidth disabled>
              Материалы (скоро)
            </ActionButton>

            {user.role === "ADMIN" && (
              <ActionButton fullWidth onClick={onOpenAdmin}>
                Панель тренера
              </ActionButton>
            )}

            <ActionButton
              fullWidth
              variant="outline"
              onClick={handleLogout}
              leftIcon={<IconLogout size={18} />}
            >
              Выйти
            </ActionButton>
          </Stack>
        )}

        {section === "trainings" &&
          (showBlock ? (
            <ClientBlock
              onBack={() => setShowBlock(false)}
              onToProfile={() => setSection("main")}
            />
          ) : (
            <ClientSchedule
              onBack={() => setSection("main")}
              onOpenBlock={() => setShowBlock(true)}
            />
          ))}

        {section === "nutrition" && (
          <ClientNutrition
            userId={user.id}
            onBack={() => setSection("main")}
          />
        )}
      </div>
    </div>
  );
}
