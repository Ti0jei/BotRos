import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconCheck,
  IconArrowBack,
} from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import CardBlock from "@/components/ui/CardBlock";
import FormSection from "@/components/ui/FormSection";
import ActionButton from "@/components/ui/ActionButton";

interface Client {
  id: string;
  name: string;
}

interface PaymentBlock {
  id: string;
  date: string;
  paidTrainings: number;
  used: number;
  pricePerTraining: number;
  pricePerBlock?: number;
  active: boolean;
}

export default function ClientPayments({
  client,
  onBack,
}: {
  client: Client;
  onBack: () => void;
}) {
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [date, setDate] = useState<Date | null>(new Date());
  const [paidTrainings, setPaidTrainings] = useState<number>(8);
  const [pricePerTraining, setPricePerTraining] = useState<number>(600);
  const [pricePerBlock, setPricePerBlock] = useState<number>(4800);
  const [used, setUsed] = useState<number>(0);

  const syncFromTraining = (val: number) => {
    setPricePerTraining(val);
    setPricePerBlock(val * paidTrainings);
  };

  const syncFromBlock = (val: number) => {
    setPricePerBlock(val);
    setPricePerTraining(paidTrainings > 0 ? Math.round(val / paidTrainings) : 0);
  };

  const syncFromTrainings = (val: number) => {
    setPaidTrainings(val);
    setPricePerBlock(val * pricePerTraining);
  };

  const loadBlock = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/payment-blocks/user/${client.id}/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setBlock(data);
      setDate(new Date(data.date));
      setPaidTrainings(data.paidTrainings);
      setPricePerTraining(data.pricePerTraining);
      setPricePerBlock(data.pricePerBlock || data.pricePerTraining * data.paidTrainings);
      setUsed(data.used);
    } else {
      setBlock(null);
    }

    setLoading(false);
  };

  const createBlock = async () => {
    const confirm = window.confirm("Создать новый блок оплаты?");
    if (!confirm) return;

    const res = await fetch(`${API}/api/payment-blocks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: client.id,
        paidAt: date,
        paidTrainings,
        pricePerTraining,
        pricePerBlock,
      }),
    });

    if (res.ok) {
      showNotification({
        title: "Блок создан",
        message: "Новая оплата успешно добавлена",
        color: "green",
        icon: <IconCheck size={18} />,
      });
      await loadBlock();
    } else {
      showNotification({
        title: "Ошибка",
        message: "Не удалось добавить блок оплаты",
        color: "red",
      });
    }
  };

  const updateBlock = async () => {
    if (!block) return;

    const res = await fetch(`${API}/api/payment-blocks/${block.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paidAt: date,
        paidTrainings,
        pricePerTraining,
        pricePerBlock,
        used,
      }),
    });

    if (res.ok) {
      showNotification({
        title: "Обновлено",
        message: "Блок оплаты обновлён",
        color: "green",
      });
      setEditMode(false);
      await loadBlock();
    } else {
      showNotification({
        title: "Ошибка",
        message: "Не удалось обновить блок",
        color: "red",
      });
    }
  };

  useEffect(() => {
    loadBlock();
  }, []);

  return (
    <div className="bg-white min-h-screen px-4 pb-28">
      <div className="max-w-sm mx-auto pt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          💸 Оплаты — {client.name}
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Загрузка...</p>
        ) : block ? (
          <CardBlock>
            <FormSection title="Активный блок">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Использовано:</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    block.used >= block.paidTrainings
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {block.used} / {block.paidTrainings}
                </span>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <DatePickerInput
                    value={date}
                    onChange={setDate}
                    locale="ru"
                    dropdownType="popover"
                    clearable={false}
                    nextIcon={<IconChevronRight size={16} />}
                    previousIcon={<IconChevronLeft size={16} />}
                    className="mb-2"
                  />

                  <label className="block text-xs text-gray-600">Кол-во тренировок</label>
                  <input
                    type="number"
                    value={paidTrainings}
                    onChange={(e) => syncFromTrainings(Number(e.target.value))}
                    className="w-full border rounded p-2 text-sm"
                    min={1}
                  />

                  <label className="block text-xs text-gray-600">Цена за тренировку, ₽</label>
                  <input
                    type="number"
                    value={pricePerTraining}
                    onChange={(e) => syncFromTraining(Number(e.target.value))}
                    className="w-full border rounded p-2 text-sm"
                    min={1}
                  />

                  <label className="block text-xs text-gray-600">Цена за блок, ₽</label>
                  <input
                    type="number"
                    value={pricePerBlock}
                    onChange={(e) => syncFromBlock(Number(e.target.value))}
                    className="w-full border rounded p-2 text-sm"
                    min={1}
                  />

                  <label className="block text-xs text-gray-600">Уже использовано</label>
                  <input
                    type="number"
                    value={used}
                    onChange={(e) => setUsed(Number(e.target.value))}
                    className="w-full border rounded p-2 text-sm"
                    min={0}
                    max={paidTrainings}
                  />

                  <ActionButton fullWidth onClick={updateBlock}>
                    💾 Сохранить изменения
                  </ActionButton>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Дата оплаты: {dayjs(block.date).format("DD.MM.YYYY")}</p>
                  <p>Цена за тренировку: {block.pricePerTraining}₽</p>
                  <p>Всего тренировок: {block.paidTrainings}</p>
                  <p>Использовано: {block.used}</p>
                  <p className="font-semibold">
                    Осталось: {block.paidTrainings - block.used}
                  </p>
                  <p className="font-medium">
                    Цена блока: {block.pricePerBlock || pricePerBlock}₽
                  </p>

                  <ActionButton
                    fullWidth
                    variant="outline"
                    onClick={() => setEditMode(true)}
                    leftIcon={<IconEdit size={16} />}
                  >
                    Редактировать
                  </ActionButton>
                </div>
              )}
            </FormSection>
          </CardBlock>
        ) : (
          <>
            <p className="text-sm text-red-500 font-semibold mb-2">
              🔴 Блок не оплачен
            </p>
            <CardBlock>
              <FormSection title="➕ Добавить блок">
                <div className="space-y-3">
                  <DatePickerInput
                    value={date}
                    onChange={setDate}
                    locale="ru"
                    dropdownType="popover"
                    clearable={false}
                    nextIcon={<IconChevronRight size={16} />}
                    previousIcon={<IconChevronLeft size={16} />}
                    className="mb-2"
                  />

                  <label className="block text-xs text-gray-600">Кол-во тренировок</label>
                  <input
                    type="number"
                    value={paidTrainings}
                    onChange={(e) => syncFromTrainings(Number(e.target.value))}
                    className="w-full border rounded p-2 text-sm"
                    min={1}
                  />

                  <label className="block text-xs text-gray-600">Цена за тренировку, ₽</label>
                  <input
                    type="number"
                    value={pricePerTraining}
                    onChange={(e) => syncFromTraining(Number(e.target.value))}
                    className="w-full border rounded p-2 text-sm"
                    min={1}
                  />

                  <label className="block text-xs text-gray-600">Цена за блок, ₽</label>
                  <input
                    type="number"
                    value={pricePerBlock}
                    onChange={(e) => syncFromBlock(Number(e.target.value))}
                    className="w-full border rounded p-2 text-sm"
                    min={1}
                  />

                  <p className="text-sm text-gray-500 mt-1">
                    💰 Итого: {pricePerBlock}₽
                  </p>

                  <ActionButton fullWidth onClick={createBlock}>
                    💾 Сохранить
                  </ActionButton>
                </div>
              </FormSection>
            </CardBlock>
          </>
        )}

        <div className="fixed bottom-0 left-0 w-full bg-white py-4 shadow-md z-50">
          <div className="max-w-sm mx-auto px-4">
            <ActionButton
              fullWidth
              variant="outline"
              leftIcon={<IconArrowBack size={16} />}
              onClick={onBack}
            >
              Назад к профилю
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
