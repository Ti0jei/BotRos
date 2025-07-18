import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs'; // ✅ импорт Dayjs
import AssignModal from './AdminSchedule/AssignModal';
import { User, PaymentBlock } from './AdminSchedule/types';

export default function AssignTrainingPage({ setView }: { setView: (v: string) => void }) {
  const [clients, setClients] = useState<User[]>([]);
  const [blocks, setBlocks] = useState<Record<string, PaymentBlock | null>>({});
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs()); // ✅ Dayjs вместо Date
  const [isSinglePaid, setIsSinglePaid] = useState(false);

  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_BASE_URL;

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

  useEffect(() => {
    const uid = localStorage.getItem("assignUserId");
    const sp = localStorage.getItem("assignSinglePaid");

    if (uid) setSelectedUser(uid);
    if (sp === "true") setIsSinglePaid(true);
    if (sp === "false") setIsSinglePaid(false);

    localStorage.removeItem("assignUserId");
    localStorage.removeItem("assignSinglePaid");
  }, []);

  const assignTraining = async (
    templateId: string | null,
    selectedDateStr: string,
    singlePrice?: number | null,
    singlePaymentMethod?: string | null
  ) => {
    if (!selectedUser || selectedHour === null || !selectedDateStr) return;

    try {
      const res = await fetch(`${API}/api/trainings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser,
          date: selectedDateStr, // ✅ уже в формате YYYY-MM-DD
          hour: selectedHour,
          isSinglePaid,
          templateId,
          singlePrice,
          singlePaymentMethod
        }),
      });

      if (res.ok) {
        alert("Тренировка назначена ✅");
        setView("clients");
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
        setView("clients");
      }}
      onAssign={assignTraining}
      clients={clients}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      isSinglePaid={isSinglePaid}
      setIsSinglePaid={setIsSinglePaid}
      selectedHour={selectedHour}
      setSelectedHour={setSelectedHour}
      selectedDate={selectedDate} // ✅ передаём Dayjs
      setSelectedDate={setSelectedDate}
      blocks={blocks}
    />
  );
}
