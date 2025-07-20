import {
  Modal,
  Button,
  Select,
  Checkbox,
  Group,
  Text,
  Stack,
  Box,
  TextInput,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { User, PaymentBlock, WorkoutTemplate } from "./types";
import { IconCheck } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { Dayjs } from "dayjs";
import { blurActiveElement } from "@/utils/blurActiveElement"; // ✅ добавлен импорт

interface Props {
  opened: boolean;
  onClose: () => void;
  clients: User[];
  blocks: Record<string, PaymentBlock | null>;
  selectedHour: number | null;
  selectedDate: Dayjs;
  onSuccess: () => void;
}

export default function AssignModalFromCalendar({
  opened,
  onClose,
  clients,
  blocks,
  selectedHour,
  selectedDate,
  onSuccess,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isSinglePaid, setIsSinglePaid] = useState(false);
  const [singlePrice, setSinglePrice] = useState<string>("");
  const [singlePaymentMethod, setSinglePaymentMethod] = useState<"cash" | "online" | "">("");
  const [lastTemplate, setLastTemplate] = useState<WorkoutTemplate | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const isPast = selectedDate.startOf("day").isBefore(new Date().setHours(0, 0, 0, 0));
  const footerRef = useRef<HTMLDivElement>(null);
  const [bottomOffset, setBottomOffset] = useState(100);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const block = selectedUser ? blocks[selectedUser] : null;
  const hasActiveBlock = block && block.paidTrainings > (block.used ?? 0);

  const handleAssign = async () => {
    if (!selectedUser || selectedHour === null) return;

    if (!hasActiveBlock && !isSinglePaid) {
      showNotification({
        title: "Нет активного блока",
        message: 'Выберите "Разовая оплата", если хотите продолжить',
        color: "red",
      });
      return;
    }

    if (isSinglePaid && (!singlePrice || !singlePaymentMethod)) {
      showNotification({
        title: "Укажите данные оплаты",
        message: "Нужно ввести сумму и способ оплаты",
        color: "red",
      });
      return;
    }

    const res = await fetch(`${API}/api/trainings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selectedUser,
        hour: selectedHour,
        date: selectedDate.format("YYYY-MM-DD"),
        isSinglePaid,
        singlePrice: isSinglePaid ? parseInt(singlePrice) : undefined,
        singlePaymentMethod: isSinglePaid ? singlePaymentMethod : undefined,
        templateId: selectedTemplateId || undefined,
      }),
    });

    if (res.ok) {
      showNotification({
        title: "Назначено",
        message: "Тренировка успешно добавлена",
        color: "green",
        icon: <IconCheck />,
      });
      onSuccess();
      onClose();
      setSelectedUser(null);
      setIsSinglePaid(false);
      setSinglePrice("");
      setSinglePaymentMethod("");
      setSelectedTemplateId(null);
    } else {
      showNotification({
        title: "Ошибка",
        message: "Не удалось назначить тренировку",
        color: "red",
      });
    }
  };

  useEffect(() => {
    if (!opened) return;

    const assignUserId = localStorage.getItem("assignUserId");
    const assignSinglePaid = localStorage.getItem("assignSinglePaid") === "true";

    setSelectedUser(assignUserId || null);
    setIsSinglePaid(assignSinglePaid);
    setSinglePrice("");
    setSinglePaymentMethod("");
    setSelectedTemplateId(null);
    setLastTemplate(null);
    setTemplates([]);

    if (selectedDate) {
      localStorage.setItem("calendarSelectedDate", selectedDate.format("YYYY-MM-DD"));
    }
  }, [opened]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchTemplates = async () => {
      try {
        const resLast = await fetch(
          `${API}/api/workout-templates/last-template?userId=${selectedUser}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const resList = await fetch(`${API}/api/workout-templates/user/${selectedUser}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const last = await resLast.json();
        const list = await resList.json();

        setLastTemplate(last || null);
        setTemplates(list || []);
      } catch (e) {
        console.error("Ошибка загрузки программы тренировки:", e);
      }
    };

    fetchTemplates();

    if (selectedUser && !hasActiveBlock) {
      setIsSinglePaid(true);
    }
  }, [selectedUser]);

  useEffect(() => {
    const resize = () => {
      if (footerRef.current) {
        setBottomOffset(footerRef.current.offsetHeight + 24);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Назначить тренировку"
        centered
        size="sm"
        radius="xl"
        scrollAreaComponent="div"
        styles={{
          title: { fontWeight: 700, fontSize: 20 },
          header: { borderBottom: "1px solid #ddd" },
          body: {
            padding: 16,
            maxHeight: "75vh",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: bottomOffset,
          },
        }}
      >
        <Stack spacing="md">
          <Box>
            <Text fw={600} mb={4}>
              Клиент
            </Text>
            <Select
              data={clients.map((c) => ({
                label: `${c.lastName || ""} ${c.name}${c.internalTag ? ` (${c.internalTag})` : ""}`,
                value: c.id,
              }))}
              placeholder="Выберите клиента"
              value={selectedUser}
              onChange={(val) => {
                blurActiveElement(); // ✅ добавлено
                setSelectedUser(val);
              }}
              searchable
              nothingFound="Не найдено"
            />
          </Box>

          {selectedUser && lastTemplate && (
            <Text size="sm" c="dimmed">
              Прошлая тренировка: <b>{lastTemplate.title}</b>
            </Text>
          )}

          {selectedUser && (
            <Select
              label="Следующая программа тренировок"
              placeholder="По очереди или выбрать вручную"
              data={templates.map((t) => ({
                label: t.title,
                value: t.id,
              }))}
              value={selectedTemplateId}
              onChange={(val) => {
                blurActiveElement(); // ✅ добавлено
                setSelectedTemplateId(val);
              }}
              clearable
            />
          )}

          {selectedUser && !hasActiveBlock && (
            <Text color="red" size="sm">
              У клиента нет активного блока — доступна только разовая оплата
            </Text>
          )}

          <Checkbox
            label="Разовая оплата"
            checked={isSinglePaid}
            onChange={(e) => setIsSinglePaid(e.currentTarget.checked)}
            disabled={!hasActiveBlock}
          />

          {isSinglePaid && (
            <>
              <TextInput
                label="Сумма (₽)"
                placeholder="Введите сумму"
                type="number"
                value={singlePrice}
                onChange={(e) => setSinglePrice(e.currentTarget.value)}
                required
                inputMode="numeric"
                pattern="[0-9]*"
                onBlur={() => window.scrollTo({ top: 0 })}
              />
              <Select
                label="Способ оплаты"
                placeholder="Выберите способ"
                data={[
                  { value: "cash", label: "Наличные" },
                  { value: "online", label: "Онлайн" },
                ]}
                value={singlePaymentMethod}
                onChange={(val) => {
                  blurActiveElement(); // ✅ добавлено
                  setSinglePaymentMethod(val as "cash" | "online" | "");
                }}
                required
              />
            </>
          )}

          <Group position="right" mt="md">
            <Button
              onClick={handleAssign}
              variant="outline"
              disabled={isPast}
              style={{
                borderRadius: 12,
                fontWeight: 500,
                paddingLeft: 20,
                paddingRight: 20,
                color: isPast ? "#aaa" : "#1a1a1a",
                border: "1px solid #1a1a1a",
                backgroundColor: "#fff",
                cursor: isPast ? "not-allowed" : "pointer",
              }}
            >
              Назначить
            </Button>
          </Group>
        </Stack>
      </Modal>

      <div
        ref={footerRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid #ddd",
          padding: 12,
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        <Button
          variant="outline"
          fullWidth
          onClick={onClose}
          style={{
            borderRadius: 12,
            fontWeight: 500,
            color: "#1a1a1a",
            border: "1px solid #1a1a1a",
            backgroundColor: "#fff",
          }}
        >
          Назад к профилю
        </Button>
      </div>
    </>
  );
}
