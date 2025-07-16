import { useEffect, useState } from 'react';
import AssignModal from './AdminSchedule/AssignModal';
import { User, PaymentBlock } from './AdminSchedule/types';

export default function AssignTrainingPage({ setView }: { setView: (v: string) => void }) {
  const [clients, setClients] = useState<User[]>([]);
  const [blocks, setBlocks] = useState<Record<string, PaymentBlock | null>>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [isSinglePaid, setIsSinglePaid] = useState(false);

  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_BASE_URL;

  // Загрузка клиентов
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

  // Загрузка блоков
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

  // Подхватываем данные из localStorage
  useEffect(() => {
    const uid = localStorage.getItem("assignUserId");
    const sp = localStorage.getItem("assignSinglePaid");

    if (uid) setSelectedUser(uid);
    if (sp === "true") setIsSinglePaid(true);
    if (sp === "false") setIsSinglePaid(false);

    localStorage.removeItem("assignUserId");
    localStorage.removeItem("assignSinglePaid");
  }, []);

  // Назначение
  const assignTraining = async () => {
    if (!selectedUser || selectedHour === null) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(`${API}/api/trainings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: selectedUser,
          date: today,
          hour: selectedHour,
          isSinglePaid,
        }),
      });

      if (res.ok) {
        alert("Тренировка назначена ✅");
        setView("clients"); // ✅ назад к клиентам
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
      onClose={() => {
        console.log("Закрытие модалки через крестик");
        setView("clients"); // ✅ назад к клиентам
      }}
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
