// 💾 AssignModal.tsx (без Modal, без зависаний на iPhone)
import { useEffect, useState } from "react";
import {
  Card,
  Stack,
  Text,
  Select,
  Checkbox,
  Button,
  Divider,
  Title,
  Group,
  Badge,
  NumberInput,
  ScrollArea,
} from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "dayjs/locale/ru";
import { blurActiveElement } from "@/utils/blurActiveElement";

import { PaymentBlock, User } from "./types";
import CustomModalDatePicker from "@/components/ui/CustomModalDatePicker";

dayjs.extend(isSameOrBefore);

interface AssignModalProps {
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
  user: { id: string; name: string; lastName?: string };
  hour: number;
}

interface WorkoutTemplate {
  id: string;
  title: string;
}

export default function AssignModal({
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
  const [date, setDate] = useState<Dayjs>(() => dayjs());
  const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [lastTemplate, setLastTemplate] = useState<WorkoutTemplate | null>(null);
  const [singlePrice, setSinglePrice] = useState<number | null>(null);
  const [singlePaymentMethod, setSinglePaymentMethod] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");
  const block = selectedUser ? blocks[selectedUser] : null;
  const remaining = block ? block.paidTrainings - block.used : null;
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);

  useEffect(() => {
    dayjs.locale("ru");
  }, []);

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
        console.error("Ошибка загрузки программ:", e);
      }
    };
    fetchTemplates();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchLastTemplate = async () => {
      try {
        const res = await fetch(`${API}/api/workout-templates/last-template?userId=${selectedUser}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLastTemplate(data ?? null);
      } catch (e) {
        console.error("Ошибка загрузки последней программы:", e);
      }
    };
    fetchLastTemplate();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;
    const hasBlock = block && block.paidTrainings > block.used;
    setShowWarning(!hasBlock && !isSinglePaid);
    setIsSinglePaid(!hasBlock);
  }, [selectedUser, blocks]);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await fetch(`${API}/api/trainings/date/${date.format("YYYY-MM-DD")}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAssignedClients(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Ошибка загрузки клиентов:", e);
      }
    };
    fetchAssigned();
  }, [date]);

  return (
    <Card radius="xl" p="lg" withBorder shadow="xs">
      <Stack spacing="md">
        <Group>
          <IconClock size={20} />
          <Title order={4}>Назначить тренировку</Title>
        </Group>

        <CustomModalDatePicker date={date} setDate={setDate} />

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
          onDropdownClose={blurActiveElement}
        />

        {selectedUser && lastTemplate && (
          <Text size="sm" c="dimmed">
            Прошлая: <Text span fw={500}>{lastTemplate.title}</Text>
          </Text>
        )}

        {templates.length > 0 && (
          <Select
            label="Программа тренировки"
            placeholder="Выберите или оставьте авто"
            data={templates.map((t) => ({ label: t.title, value: t.id }))}
            value={selectedTemplateId}
            onChange={setSelectedTemplateId}
            clearable
            onDropdownClose={blurActiveElement}
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
              size="md"
              label="Сумма (₽)"
              placeholder="Введите сумму"
              value={singlePrice ?? undefined}
              onChange={(val) => {
                if (typeof val === "number" && !isNaN(val)) {
                  setSinglePrice(val);
                } else {
                  setSinglePrice(null);
                }
              }}
              min={0}
              radius="xl"
              hideControls
              onBlur={blurActiveElement}
            />

            <Select
              label="Способ оплаты"
              placeholder="Выберите способ"
              data={[
                { value: "cash", label: "Наличные" },
                { value: "online", label: "Онлайн" },
              ]}
              value={singlePaymentMethod}
              onChange={(val) => setSinglePaymentMethod(val)}
              onDropdownClose={blurActiveElement}
            />
          </>
        )}

        {showWarning && (
          <Text size="sm" style={{ background: "#fff4f4", padding: 8, border: "1px solid #f3c0c0", borderRadius: 8, color: "#c92a2a" }}>
            У клиента нет активного абонемента. Выберите "Разовая оплата".
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
                    <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
          onClick={() => onAssign(
            selectedTemplateId,
            dayjs(date).format("YYYY-MM-DD"),
            singlePrice,
            singlePaymentMethod
          )}
          disabled={!selectedUser || selectedHour === null || date.isBefore(dayjs(), "day")}
        >
          Назначить
        </Button>
      </Stack>
    </Card>
  );
}
