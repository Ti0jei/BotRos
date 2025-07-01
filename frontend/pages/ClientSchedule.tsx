import { useEffect, useState } from "react";
import { IconPackage, IconArrowBack } from "@tabler/icons-react";
import dayjs from "dayjs";
import { getToken } from "../utils/auth";
import CardBlock from "@/components/ui/CardBlock";
import ActionButton from "@/components/ui/ActionButton";

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

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  const loadTrainings = async () => {
    const res = await fetch(`${API}/api/trainings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
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
  };

  const updateStatus = async (
    id: string,
    status: "CONFIRMED" | "DECLINED"
  ) => {
    await fetch(`${API}/api/trainings/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    setEditingId(null);
    loadTrainings();
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  return (
    <div className="bg-white min-h-screen p-4">
      <div className="max-w-sm mx-auto">
        <CardBlock>
          <h2 className="text-lg font-semibold mb-4">Мои тренировки</h2>

          <ActionButton
            fullWidth
            variant="outline"
            leftIcon={<IconPackage size={20} />}
            className="mb-4"
            onClick={onOpenBlock}
          >
            📦 Блок тренировок
          </ActionButton>

          {trainings.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-4">
              У вас пока нет назначенных тренировок.
            </p>
          ) : (
            <div className="space-y-4">
              {trainings.map((t) => (
                <div
                  key={t.id}
                  className="border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-sm">
                      {dayjs(t.date).format("DD.MM.YYYY")} в {t.hour}:00
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        t.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : t.status === "DECLINED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.status === "CONFIRMED"
                        ? "ПОДТВЕРЖДЕНО"
                        : t.status === "DECLINED"
                        ? "ОТМЕНЕНО"
                        : "ОЖИДАНИЕ"}
                    </span>
                  </div>

                  {t.status === "PENDING" || editingId === t.id ? (
                    <div className="space-y-2">
                      <ActionButton
                        fullWidth
                        onClick={() => updateStatus(t.id, "CONFIRMED")}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        ✅ Приду
                      </ActionButton>
                      <ActionButton
                        fullWidth
                        onClick={() => updateStatus(t.id, "DECLINED")}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        ❌ Не приду
                      </ActionButton>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        {t.status === "CONFIRMED"
                          ? "✅ Вы подтвердили участие"
                          : "🚫 Вы отказались от тренировки"}
                      </p>
                      <ActionButton
                        fullWidth
                        variant="outline"
                        onClick={() => setEditingId(t.id)}
                      >
                        Изменить решение
                      </ActionButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <ActionButton
            fullWidth
            variant="outline"
            className="mt-6"
            leftIcon={<IconArrowBack size={18} />}
            onClick={onBack}
          >
            Назад к профилю
          </ActionButton>
        </CardBlock>
      </div>
    </div>
  );
}
