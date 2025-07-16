import {
  Modal,
  ModalBody,
  Button,
  Select,
  Checkbox,
  Group,
  Text,
  Stack,
  Box,
  TextInput,
  ScrollArea,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { User, PaymentBlock, WorkoutTemplate } from "./types";
import { IconCheck } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";

interface Props {
  opened: boolean;
  onClose: () => void;
  clients: User[];
  blocks: Record<string, PaymentBlock | null>;
  selectedHour: number | null;
  selectedDate: string; // YYYY-MM-DD
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
        date: selectedDate,
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
    setSelectedUser(null);
    setIsSinglePaid(false);
    setSinglePrice("");
    setSinglePaymentMethod("");
    setSelectedTemplateId(null);
    setLastTemplate(null);
    setTemplates([]);
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
  }, [selectedUser]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Назначить тренировку"
      centered
      size="sm"
      radius="xl"
      styles={{
        title: { fontWeight: 700, fontSize: 20 },
        header: { borderBottom: "1px solid #ddd" },
        body: { padding: 0 },
      }}
    >
      <ModalBody p={0}>
        <ScrollArea style={{ maxHeight: "70vh", padding: 16 }}>
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
                onChange={setSelectedUser}
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
                onChange={(val) => setSelectedTemplateId(val)}
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
              disabled={!selectedUser || !hasActiveBlock}
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
                />
                <Select
                  label="Способ оплаты"
                  placeholder="Выберите способ"
                  data={[
                    { value: "cash", label: "Наличные" },
                    { value: "online", label: "Онлайн" },
                  ]}
                  value={singlePaymentMethod}
                  onChange={(val) =>
                    setSinglePaymentMethod(val as "cash" | "online" | "")
                  }
                  required
                />
              </>
            )}

            <Group position="right" mt="md">
              <Button
                onClick={handleAssign}
                variant="outline"
                style={{
                  borderRadius: 12,
                  fontWeight: 500,
                  paddingLeft: 20,
                  paddingRight: 20,
                  color: "#1a1a1a",
                  border: "1px solid #1a1a1a",
                  backgroundColor: "#fff",
                }}
              >
                Назначить
              </Button>
            </Group>
          </Stack>
        </ScrollArea>
      </ModalBody>
    </Modal>
  );
}
