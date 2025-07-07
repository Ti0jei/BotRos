import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AssignModal from "./AdminSchedule/AssignModal";
import { User, PaymentBlock } from "./AdminSchedule/types";

export default function AssignTrainingPage() {
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState<User[]>([]);
  const [blocks, setBlocks] = useState<Record<string, PaymentBlock | null>>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isSinglePaid, setIsSinglePaid] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_BASE_URL;

  // Подгрузка клиентов
  useEffect(() => {
    fetch(`${API}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: User[]) => {
        setClients(data);
        data.forEach((client) => loadBlock(client.id));
      });
  }, []);

  // Подгрузка блоков
  const loadBlock = async (userId: string) => {
    try {
      const res = await fetch(`${API}/api/payment-blocks/user/${userId}/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : null;
      setBlocks((prev) => ({ ...prev, [userId]: data }));
    } catch (err) {
      console.error("Ошибка загрузки блока:", err);
    }
  };

  // Парсинг userId и singlePaid из URL
  useEffect(() => {
    const uid = searchParams.get("userId");
    const sp = searchParams.get("singlePaid");

    if (uid) setSelectedUser(uid);
    if (sp === "true") setIsSinglePaid(true);
    if (sp === "false") setIsSinglePaid(false);
  }, []);

  // Назначение тренировки
  const assignTraining = async () => {
    if (!selectedUser || selectedHour === null) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(`${API}/api/trainings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser,
          date: today,
          hour: selectedHour,
          isSinglePaid,
        }),
      });

      if (res.ok) {
        alert("Тренировка назначена ✅");
        navigate(-1); // назад
      } else {
        const error = await res.json();
        alert("Ошибка: " + error.error);
      }
    } catch (err) {
      console.error("Ошибка при назначении:", err);
      alert("Не удалось назначить тренировку");
    }
  };

  return (
    <AssignModal
      opened={true}
      onClose={() => navigate(-1)}
      onAssign={assignTraining}
      clients={clients}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      isSinglePaid={isSinglePaid}
      setIsSinglePaid={setIsSinglePaid}
      selectedHour={selectedHour}
      setSelectedHour={setSelectedHour}
      blocks={blocks}
    />
  );
}
