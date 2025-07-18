import { useEffect, useState } from "react";
import {
  Modal,
  Stack,
  Text,
  Select,
  Checkbox,
  Button,
  Card,
  Divider,
  Title,
  Group,
  Badge,
  NumberInput,
  Box,
  ScrollArea,
} from "@mantine/core";
import { IconClock, IconX } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";

import { PaymentBlock, User } from "./types";
import CustomModalDatePicker from "../../components/ui/CustomModalDatePicker";

interface AssignModalProps {
  opened: boolean;
  onClose: () => void;
  onAssign: (
    templateId: string | null,
    date: string,
    singlePrice?: number | null,
    singlePaymentMethod?: string | null
  ) => void;
  clients: User[];
  selectedUser: string | null;
  setSelectedUser: (id: string | null) => void;
  isSinglePaid: boolean;
  setIsSinglePaid: (v: boolean) => void;
  selectedHour: number | null;
  setSelectedHour: (hour: number) => void;
  blocks: Record<string, PaymentBlock | null>;
}

interface AssignedClient {
  user: {
    id: string;
    name: string;
    lastName?: string;
  };
  hour: number;
}

interface WorkoutTemplate {
  id: string;
  title: string;
}

export default function AssignModal({
  opened,
  onClose,
  onAssign,
  clients,
  selectedUser,
  setSelectedUser,
  isSinglePaid,
  setIsSinglePaid,
  selectedHour,
  setSelectedHour,
  blocks,
}: AssignModalProps) {
  const [date, setDate] = useState<Dayjs>(() => {
    const savedDate = localStorage.getItem("assignDate");
    return savedDate ? dayjs(savedDate) : dayjs();
  });
  const [showWarning, setShowWarning] = useState(false);
  const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [lastTemplate, setLastTemplate] = useState<WorkoutTemplate | null>(null);
  const [singlePrice, setSinglePrice] = useState<number | null>(null);
  const [singlePaymentMethod, setSinglePaymentMethod] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_BASE_URL;
  const block = selectedUser ? blocks[selectedUser] : null;
  const remaining = block ? block.paidTrainings - block.used : null;
  const isClientPreselected = !!selectedUser;
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);

  useEffect(() => {
    dayjs.locale("ru");
  }, []);

  useEffect(() => {
    if (!selectedUser && opened) {
      const savedUser = localStorage.getItem("assignUserId");
      const savedPaid = localStorage.getItem("assignSinglePaid") === "true";
      const savedDate = localStorage.getItem("assignDate");

      if (savedUser) {
        setSelectedUser(savedUser);
        setIsSinglePaid(savedPaid);
      }

      if (savedDate) {
        setDate(dayjs(savedDate));
      }
    }
  }, [opened]);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${API}/api/workout-templates/user/${selectedUser}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = res.ok ? await res.json() : [];
        setTemplates(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Ошибка загрузки программы тренировок:", e);
      }
    };
    fetchTemplates();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser || !opened) return;
    const fetchLastTemplate = async () => {
      try {
        const res = await fetch(`${API}/api/workout-templates/last-template?userId=${selectedUser}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLastTemplate(data ?? null);
      } catch (e) {
        console.error("Ошибка загрузки последней программы тренировок:", e);
      }
    };
    fetchLastTemplate();
  }, [selectedUser, opened]);

  useEffect(() => {
    if (!selectedUser) return;
    const block = blocks[selectedUser];
    const hasBlock = block && block.paidTrainings > block.used;
    setShowWarning(!hasBlock && !isSinglePaid);
    setIsSinglePaid(!hasBlock);
  }, [selectedUser, blocks]);

  useEffect(() => {
    const loadAssigned = async () => {
      try {
        const res = await fetch(`${API}/api/trainings/date/${date.format("YYYY-MM-DD")}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAssignedClients(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Ошибка загрузки клиентов по дате:", e);
      }
    };
    if (opened) loadAssigned();
  }, [date, opened]);

  const handleClose = () => {
    localStorage.removeItem("assignUserId");
    localStorage.removeItem("assignSinglePaid");
    localStorage.removeItem("assignDate");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={false}
      centered
      radius="xl"
      size="md"
      scrollAreaComponent="div"
      styles={{ body: { padding: 0 } }}
    >
      <Card radius="xl" p="lg" withBorder shadow="xs" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <Stack spacing="md">
          <Group position="apart">
            <Group spacing={8}>
              <IconClock size={20} />
              <Title order={4}>Назначить тренировку</Title>
            </Group>
            <Button
              onClick={handleClose}
              variant="subtle"
              color="dark"
              px={0}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconX size={18} />
            </Button>
          </Group>

          <CustomModalDatePicker date={date} setDate={setDate} />

          {!isClientPreselected ? (
            <Select
              label="Клиент"
              placeholder="Выберите клиента"
              data={clients.map((c) => ({
                value: c.id,
                label: `${c.name} ${c.lastName ?? ""}${c.internalTag ? ` (${c.internalTag})` : ""}`,
              }))}
              value={selectedUser}
              onChange={(val) => setSelectedUser(val || null)}
              radius="md"
              size="md"
              withinPortal
            />
          ) : (
            <Text size="sm">
              Клиент: <b>{clients.find((c) => c.id === selectedUser)?.name} {clients.find((c) => c.id === selectedUser)?.lastName ?? ""}</b>
            </Text>
          )}

          {selectedUser && lastTemplate && (
            <Text size="sm" c="dimmed" mt="xs">
              Прошлая тренировка: <Text span fw={500} c="dark">{lastTemplate.title}</Text>
            </Text>
          )}

          {templates.length > 0 && (
            <Select
              label="Программа тренировки"
              placeholder="Авто (ротация) или выберите вручную"
              data={templates.map((t) => ({ label: t.title, value: t.id }))}
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
              clearable
            />
          )}

          {remaining !== null && !isSinglePaid && (
            <Badge color={remaining > 0 ? "green" : "red"} size="sm">
              Осталось тренировок: {remaining}
            </Badge>
          )}

          <Checkbox
            label="Разовая оплата"
            checked={isSinglePaid}
            onChange={(e) => setIsSinglePaid(e.currentTarget.checked)}
            radius="md"
            size="md"
            disabled={!block}
          />

          {isSinglePaid && (
            <>
              <NumberInput
                label="Стоимость"
                placeholder="Введите сумму"
                value={singlePrice}
                onChange={(val) => setSinglePrice(typeof val === "number" ? val : null)}
                min={0}
              />
              <Select
                label="Способ оплаты"
                placeholder="Выберите"
                data={[
                  { label: "Наличные", value: "cash" },
                  { label: "Онлайн", value: "online" },
                ]}
                value={singlePaymentMethod}
                onChange={(val) => setSinglePaymentMethod(val)}
                clearable
              />
            </>
          )}

          {showWarning && (
            <Text
              size="sm"
              style={{
                backgroundColor: "#fff4f4",
                padding: "8px 12px",
                borderRadius: 8,
                color: "#c92a2a",
                border: "1px solid #f3c0c0",
              }}
            >
              У клиента нет активного блока. Чтобы продолжить, выберите "Разовая оплата".
            </Text>
          )}

          <Divider />

          <Text size="sm" fw={500}>Выберите время:</Text>

          <ScrollArea h={200} offsetScrollbars>
            <Stack spacing={6}>
              {hours.map((h) => {
                const usersAtThisHour = assignedClients
                  .filter((a) => a.hour === h)
                  .map((a) => `${a.user.name}${a.user.lastName ? ` ${a.user.lastName}` : ""}`)
                  .join(", ");

                return (
                  <Group key={h} spacing="xs" align="center" noWrap>
                    <Button
                      variant={selectedHour === h ? "filled" : "outline"}
                      color="dark"
                      size="xs"
                      radius="xl"
                      onClick={() => setSelectedHour(h)}
                      style={{ minWidth: 60 }}
                    >
                      {h}:00
                    </Button>
                    {usersAtThisHour && (
                      <Text
                        size="xs"
                        c="dimmed"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {usersAtThisHour}
                      </Text>
                    )}
                  </Group>
                );
              })}
            </Stack>
          </ScrollArea>

          <Button
            fullWidth
            radius="xl"
            color="dark"
            size="md"
            onClick={() =>
              onAssign(
                selectedTemplateId,
                date.format("YYYY-MM-DD"),
                singlePrice,
                singlePaymentMethod
              )
            }
            style={{ fontWeight: 600 }}
            disabled={!selectedUser || selectedHour === null}
          >
            Назначить
          </Button>
        </Stack>
      </Card>
    </Modal>
  );
}
