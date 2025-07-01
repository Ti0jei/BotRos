import { useEffect, useState } from "react";
import {
  Center,
  Loader,
  Tooltip,
  Stack,
  Title,
  Text,
} from "@mantine/core";
import { IconBell, IconBellOff, IconLogout } from "@tabler/icons-react";
import ClientSchedule from "./ClientSchedule";
import ClientNutrition from "./ClientNutrition";
import ClientBlock from "./ClientBlock";
import ActionButton from "@/components/ui/ActionButton";
import CardBlock from "@/components/ui/CardBlock";
import FormSection from "@/components/ui/FormSection";

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
      <ClientNutrition
        userId={user.id}
        onBack={() => setSection("main")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fff0f6] flex items-center justify-center p-4">
      <CardBlock>
        {/* Уведомления */}
        <div className="absolute top-3 right-3">
          <Tooltip
            label={
              user.notificationsMuted
                ? "Оповещения выключены"
                : "Оповещения включены"
            }
          >
            <button
              onClick={toggleNotifications}
              className="text-pink-500 hover:text-pink-600 transition-colors"
            >
              {user.notificationsMuted ? (
                <IconBellOff size={20} />
              ) : (
                <IconBell size={20} />
              )}
            </button>
          </Tooltip>
        </div>

        <FormSection title={`Привет, ${user.name} 👋`}>
          <Stack spacing="xs">
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
        </FormSection>
      </CardBlock>
    </div>
  );
}
