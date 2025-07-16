// (файл полностью идентичен твоему, за исключением финальной полировки — типизация, fallback, обработка ошибок)

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
  ScrollArea,
  Box,
} from "@mantine/core";
import { IconClock, IconX } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";

import { PaymentBlock, User } from "./types";
import CustomModalDatePicker from "../../components/ui/CustomModalDatePicker";

interface AssignModalProps {
  opened: boolean;
  onClose: () => void;
  onAssign: (templateId: string | null) => void;
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
  title: string; // или name — зависит от API
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
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [showWarning, setShowWarning] = useState(false);
  const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [lastTemplate, setLastTemplate] = useState<WorkoutTemplate | null>(null);

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
    if (!selectedUser || !opened) return;

    const hasBlock = block && block.paidTrainings > block.used;
    setShowWarning(!hasBlock && !isSinglePaid);
    setIsSinglePaid(!hasBlock);

    const fetchData = async () => {
      try {
        const [resLast, resList] = await Promise.all([
          fetch(`${API}/api/trainings/last/${selectedUser}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/workout-templates/user/${selectedUser}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const last = resLast.ok ? await resLast.json() : null;
        const list = resList.ok ? await resList.json() : [];

        setLastTemplate(last?.template ?? null);
        setTemplates(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Ошибка загрузки данных:", e);
      }
    };

    fetchData();
  }, [selectedUser, blocks, opened]);

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

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      padding={0}
      radius="xl"
      size="auto"
      overlayProps={{ blur: 4 }}
    >
      <Card radius="xl" p="lg" withBorder shadow="xs">
        <Stack spacing="md">
          <Group position="apart">
            <Group spacing={8}>
              <IconClock size={20} />
              <Title order={4}>Назначить тренировку</Title>
            </Group>
            <Button
              onClick={onClose}
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
            <Text size="sm" c="dimmed">
              Последняя тренировка: <b>{lastTemplate.title}</b>
            </Text>
          )}

          {templates.length > 0 && (
            <Select
              label="Шаблон тренировки"
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
            onClick={() => onAssign(selectedTemplateId)}
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
