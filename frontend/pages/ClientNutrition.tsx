import React, { useState, useEffect } from "react";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconEdit,
  IconPlus,
  IconArrowBack,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { DatePickerInput } from "@mantine/dates";
import CardBlock from "@/components/ui/CardBlock";
import FormSection from "@/components/ui/FormSection";
import ActionButton from "@/components/ui/ActionButton";

interface NutritionDay {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Summary {
  period: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export default function ClientNutrition({
  userId,
  isAdmin = false,
  onBack,
}: {
  userId: string;
  isAdmin?: boolean;
  onBack: () => void;
}) {
  const [data, setData] = useState<NutritionDay[]>([]);
  const [weekly, setWeekly] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [formVisible, setFormVisible] = useState(false);
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [fat, setFat] = useState<number | "">("");
  const [carbs, setCarbs] = useState<number | "">("");

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/nutrition/${userId}`, { headers }).then((res) =>
        res.json()
      ),
      fetch(`${API}/api/nutrition/summary/${userId}?period=week`, {
        headers,
      }).then((res) => res.json()),
      fetch(`${API}/api/nutrition/summary/${userId}?period=month`, {
        headers,
      }).then((res) => res.json()),
    ])
      .then(([nutrition, week, month]) => {
        setData(Array.isArray(nutrition) ? nutrition : []);
        setWeekly(week);
        setMonthly(month);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const selectedRecord = data.find(
    (d) =>
      dayjs(d.date).format("YYYY-MM-DD") ===
      dayjs(selectedDate).format("YYYY-MM-DD")
  );

  const handleSave = async () => {
    if (
      !selectedDate ||
      calories === "" ||
      protein === "" ||
      fat === "" ||
      carbs === ""
    ) {
      alert("Заполните все поля");
      return;
    }

    const res = await fetch(`${API}/api/nutrition`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId,
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        calories,
        protein,
        fat,
        carbs,
      }),
    });

    if (res.ok) {
      loadData();
      setFormVisible(false);
    } else {
      alert("Ошибка при сохранении");
    }
  };

  const handleDelete = async () => {
    if (!selectedDate) return;
    const confirmed = window.confirm(
      "Вы точно хотите удалить запись за этот день?"
    );
    if (!confirmed) return;

    const res = await fetch(
      `${API}/api/nutrition/${userId}/${dayjs(selectedDate).format(
        "YYYY-MM-DD"
      )}`,
      { method: "DELETE", headers }
    );
    if (res.ok) {
      loadData();
    } else {
      alert("Ошибка при удалении");
    }
  };

  return (
    <div className="bg-white min-h-screen p-4 pb-28">
      <div className="max-w-sm mx-auto">
        <CardBlock>
          <FormSection title={isAdmin ? "Питание клиента" : "Моё питание"}>
            <DatePickerInput
              value={selectedDate}
              onChange={(val) => {
                setSelectedDate(val);
                setFormVisible(false);
              }}
              maxDate={new Date()}
              leftSection={<IconCalendar size={16} />}
              nextIcon={<IconChevronRight size={16} />}
              previousIcon={<IconChevronLeft size={16} />}
              className="mb-4"
            />

            {selectedRecord ? (
              <div className="rounded-xl shadow p-4 mb-4 text-sm text-gray-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {dayjs(selectedRecord.date).format("DD MMM YYYY")}
                  </span>
                  <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded">
                    {selectedRecord.calories} ККАЛ
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                    Б: {selectedRecord.protein} г
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                    Ж: {selectedRecord.fat} г
                  </span>
                  <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded">
                    У: {selectedRecord.carbs} г
                  </span>
                </div>
                {!isAdmin && (
                  <div className="flex justify-between gap-2 pt-2">
                    <ActionButton
                      className="text-sm"
                      variant="outline"
                      onClick={() => {
                        setFormVisible(true);
                        setCalories(selectedRecord.calories);
                        setProtein(selectedRecord.protein);
                        setFat(selectedRecord.fat);
                        setCarbs(selectedRecord.carbs);
                      }}
                      leftIcon={<IconEdit size={14} />}
                    >
                      Редактировать
                    </ActionButton>
                    <ActionButton
                      className="text-sm"
                      variant="outline"
                      onClick={handleDelete}
                      leftIcon={<IconTrash size={14} />}
                    >
                      Удалить
                    </ActionButton>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm mb-4">
                Нет данных за выбранный день
              </p>
            )}

            {!isAdmin && !formVisible && (
              <ActionButton
                fullWidth
                variant="outline"
                leftIcon={<IconPlus size={16} />}
                onClick={() => {
                  setCalories("");
                  setProtein("");
                  setFat("");
                  setCarbs("");
                  setFormVisible(true);
                }}
                className="mb-4"
              >
                Внести КБЖУ
              </ActionButton>
            )}

            {!isAdmin && formVisible && (
              <div className="rounded-xl shadow p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Калории</label>
                    <input
                      type="number"
                      className="w-full border rounded p-2 text-sm"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Белки</label>
                    <input
                      type="number"
                      className="w-full border rounded p-2 text-sm"
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Жиры</label>
                    <input
                      type="number"
                      className="w-full border rounded p-2 text-sm"
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Углеводы</label>
                    <input
                      type="number"
                      className="w-full border rounded p-2 text-sm"
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                    />
                  </div>
                </div>
                <ActionButton
                  fullWidth
                  variant="outline"
                  onClick={handleSave}
                  leftIcon={<IconPlus size={16} />}
                >
                  Сохранить
                </ActionButton>
              </div>
            )}
          </FormSection>
        </CardBlock>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {weekly && (
                <CardBlock>
                  <FormSection title="Итого за неделю">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        ККАЛ: {weekly.calories}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        Б: {weekly.protein}
                      </span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        Ж: {weekly.fat}
                      </span>
                      <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                        У: {weekly.carbs}
                      </span>
                    </div>
                  </FormSection>
                </CardBlock>
              )}
              {monthly && (
                <CardBlock>
                  <FormSection title="Итого за месяц">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        ККАЛ: {monthly.calories}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        Б: {monthly.protein}
                      </span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        Ж: {monthly.fat}
                      </span>
                      <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                        У: {monthly.carbs}
                      </span>
                    </div>
                  </FormSection>
                </CardBlock>
              )}
            </>
          )}
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white py-4 shadow-md z-50">
          <div className="max-w-sm mx-auto px-4">
            <ActionButton
              fullWidth
              variant="outline"
              leftIcon={<IconArrowBack size={16} />}
              onClick={onBack}
            >
              Назад
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
