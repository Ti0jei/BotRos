import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import {
  IconTrash,
  IconEdit,
  IconPlus,
  IconArrowBack,
} from "@tabler/icons-react";
import {
  Center,
  Card,
  Stack,
  Text,
  Group,
  Loader,
  NumberInput,
  Title,
  Divider,
} from "@mantine/core";

import CardBlock from "@/components/ui/CardBlock";
import FormSection from "@/components/ui/FormSection";
import ActionButton from "@/components/ui/ActionButton";
import CustomModalDatePicker from "@/components/ui/CustomModalDatePicker";

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
  const [selectedDate, setSelectedDate] = useState(dayjs());
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
      selectedDate.format("YYYY-MM-DD")
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
        date: selectedDate.format("YYYY-MM-DD"),
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
      `${API}/api/nutrition/${userId}/${selectedDate.format("YYYY-MM-DD")}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (res.ok) loadData();
    else alert("Ошибка при удалении");
  };

  return (
    <Center
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        padding: "2rem 1rem",
      }}
    >
      <Card
        withBorder
        radius="xl"
        p="xl"
        shadow="xs"
        style={{ width: "100%", maxWidth: 420 }}
      >
        <Stack spacing="lg">
          <Title order={3} c="#1a1a1a">
            {isAdmin ? "Питание клиента" : "Моё питание"}
          </Title>

          <CustomModalDatePicker
            date={selectedDate}
            setDate={(d) => {
              setSelectedDate(d);
              setFormVisible(false);
            }}
          />

          <Divider label="Выбранный день" labelPosition="center" />

          {selectedRecord ? (
            <Stack
              spacing="xs"
              p="sm"
              style={{ border: "1px solid #eee", borderRadius: 12 }}
            >
              <Group position="apart">
                <Text size="sm">
                  {dayjs(selectedRecord.date).locale("ru").format("D MMMM YYYY")}
                </Text>
                <Text size="xs" c="pink">
                  {selectedRecord.calories} ККАЛ
                </Text>
              </Group>
              <Group spacing={8}>
                <Text size="xs" c="green">
                  Б: {selectedRecord.protein} г
                </Text>
                <Text size="xs" c="yellow">
                  Ж: {selectedRecord.fat} г
                </Text>
                <Text size="xs" c="cyan">
                  У: {selectedRecord.carbs} г
                </Text>
              </Group>
              {!isAdmin && (
                <Group grow>
                  <ActionButton
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
                    variant="outline"
                    onClick={handleDelete}
                    leftIcon={<IconTrash size={14} />}
                  >
                    Удалить
                  </ActionButton>
                </Group>
              )}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" align="center">
              Нет данных за выбранный день
            </Text>
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
            >
              Внести КБЖУ
            </ActionButton>
          )}

          {!isAdmin && formVisible && (
            <Stack
              spacing="sm"
              p="sm"
              style={{ border: "1px solid #eee", borderRadius: 12 }}
            >
              <NumberInput
                label="Калории"
                value={calories}
                onChange={setCalories}
                min={0}
                radius="xl"
              />
              <NumberInput
                label="Белки"
                value={protein}
                onChange={setProtein}
                min={0}
                radius="xl"
              />
              <NumberInput
                label="Жиры"
                value={fat}
                onChange={setFat}
                min={0}
                radius="xl"
              />
              <NumberInput
                label="Углеводы"
                value={carbs}
                onChange={setCarbs}
                min={0}
                radius="xl"
              />
              <ActionButton
                fullWidth
                variant="outline"
                onClick={handleSave}
                leftIcon={<IconPlus size={16} />}
              >
                Сохранить
              </ActionButton>
            </Stack>
          )}

          <Divider label="Статистика" labelPosition="center" />

          {loading ? (
            <Center>
              <Loader size="sm" />
            </Center>
          ) : (
            <Stack spacing="sm">
              {weekly && (
                <CardBlock>
                  <FormSection title="Итого за неделю">
                    <Group spacing={8}>
                      <Text size="xs">ККАЛ: {weekly.calories}</Text>
                      <Text size="xs">Б: {weekly.protein}</Text>
                      <Text size="xs">Ж: {weekly.fat}</Text>
                      <Text size="xs">У: {weekly.carbs}</Text>
                    </Group>
                  </FormSection>
                </CardBlock>
              )}
              {monthly && (
                <CardBlock>
                  <FormSection title="Итого за месяц">
                    <Group spacing={8}>
                      <Text size="xs">ККАЛ: {monthly.calories}</Text>
                      <Text size="xs">Б: {monthly.protein}</Text>
                      <Text size="xs">Ж: {monthly.fat}</Text>
                      <Text size="xs">У: {monthly.carbs}</Text>
                    </Group>
                  </FormSection>
                </CardBlock>
              )}
            </Stack>
          )}

          <ActionButton
            fullWidth
            variant="outline"
            colorStyle="black"
            leftIcon={<IconArrowBack size={16} />}
            onClick={onBack}
          >
            Назад
          </ActionButton>
        </Stack>
      </Card>
    </Center>
  );
}
