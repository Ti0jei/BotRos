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
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconClock, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import { PaymentBlock, User } from "./types";

interface AssignModalProps {
  opened: boolean;
  onClose: () => void;
  onAssign: () => void;
  clients: User[];
  selectedUser: string | null;
  setSelectedUser: (id: string | null) => void;
  isSinglePaid: boolean;
  setIsSinglePaid: (v: boolean) => void;
  selectedHour: number | null;
  setSelectedHour: (hour: number) => void;
  blocks: Record<string, PaymentBlock | null>;
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
  const [showWarning, setShowWarning] = useState(false);
  const [date, setDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    dayjs.locale("ru");
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const block = blocks[selectedUser];
    const hasBlock = block && block.paidTrainings > block.used;
    setShowWarning(!hasBlock && !isSinglePaid);
    if (!hasBlock) {
      setIsSinglePaid(true);
    }
  }, [selectedUser, blocks]);

  const block = selectedUser ? blocks[selectedUser] : null;
  const remaining = block ? block.paidTrainings - block.used : null;

  const isClientPreselected = !!selectedUser;
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      padding={0}
      radius="xl"
      size="sm"
      overlayProps={{ blur: 4 }}
    >
      <Card radius="xl" p="lg" withBorder shadow="xs">
        <Stack spacing="md">
          <Group spacing={8}>
            <IconClock size={20} />
            <Title order={4}>Назначить тренировку</Title>
          </Group>

          <Group position="center" spacing="xs">
            <Button
              size="xs"
              leftIcon={<IconChevronLeft size={14} />}
              variant="outline"
              onClick={() => setDate(date.subtract(1, "day"))}
            >
              Назад
            </Button>

            <DatePickerInput
              locale="ru"
              value={date.toDate()}
              onChange={(val) => val && setDate(dayjs(val))}
              clearable
              clearButtonLabel="Очистить"
              size="xs"
              dropdownType="popover"
              hideWeekdays={false}
              nextIcon={<IconChevronRight size={14} />}
              previousIcon={<IconChevronLeft size={14} />}
              popoverProps={{ withinPortal: true, shadow: "md", radius: "md" }}
              styles={{
                input: {
                  textAlign: "center",
                  borderRadius: 12,
                  fontWeight: 600,
                  border: "1px solid #000",
                  minWidth: 130,
                },
              }}
            />

            <Button
              size="xs"
              rightIcon={<IconChevronRight size={14} />}
              variant="outline"
              onClick={() => setDate(date.add(1, "day"))}
            >
              Вперёд
            </Button>
          </Group>

          <Text size="sm" c="dimmed">
            Дата: <b>{date.format("DD.MM.YYYY")}</b>
          </Text>

          <Divider />

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
              Клиент:{" "}
              <b>
                {clients.find((c) => c.id === selectedUser)?.name}{" "}
                {clients.find((c) => c.id === selectedUser)?.lastName ?? ""}
              </b>
            </Text>
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
            disabled={!block} // ✅ Чекбокс нельзя снимать, если блока нет
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
              У клиента нет активного блока. Чтобы продолжить, оставьте "Разовая оплата".
            </Text>
          )}

          <Divider />

          <Text size="sm" fw={500}>
            Выберите время:
          </Text>

          <Group spacing="xs" wrap="wrap">
            {hours.map((h) => (
              <Button
                key={h}
                variant={selectedHour === h ? "filled" : "outline"}
                color="dark"
                size="xs"
                radius="xl"
                onClick={() => setSelectedHour(h)}
              >
                {h}:00
              </Button>
            ))}
          </Group>

          <Button
            fullWidth
            radius="xl"
            color="dark"
            size="md"
            onClick={onAssign}
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
