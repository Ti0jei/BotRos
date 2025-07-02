import { useEffect, useState } from "react";
import {
  IconBellRinging,
  IconBellOff,
  IconLogout,
} from "@tabler/icons-react";
import ClientSchedule from "./ClientSchedule";
import ClientNutrition from "./ClientNutrition";
import ClientBlock from "./ClientBlock";
import ActionButton from "@/components/ui/ActionButton";
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
    "main" | "trainings" | "nutrition"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-pink border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-sm">Не удалось загрузить профиль</p>
      </div>
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
    <div className="min-h-screen bg-pink-light flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-md w-full max-w-sm p-6">
        <FormSection
          title={
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">
                Привет, {user.name} 👋
              </span>
              <button
                title={
                  user.notificationsMuted
                    ? "Оповещения выключены"
                    : "Оповещения включены"
                }
                onClick={toggleNotifications}
                className={`p-2 rounded-full shadow-sm border ${
                  user.notificationsMuted
                    ? "bg-gray-100 text-gray-500"
                    : "bg-pink-light text-pink"
                }`}
              >
                {user.notificationsMuted ? (
                  <IconBellOff size={18} />
                ) : (
                  <IconBellRinging size={18} />
                )}
              </button>
            </div>
          }
        >
          <div className="space-y-2">
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
          </div>
        </FormSection>
      </div>
    </div>
  );
}
