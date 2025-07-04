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
  Box,
  Group,
} from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
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
  blocks,
}: AssignModalProps) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!selectedUser) return;

    const block = blocks[selectedUser];
    const hasBlock = block && block.paidTrainings > block.used;
    setShowWarning(!hasBlock && !isSinglePaid);
  }, [selectedUser, blocks, isSinglePaid]);

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
          <Group spacing="xs">
            <IconClock size={20} stroke={1.5} />
            <Title order={4} c="#1a1a1a">
              Назначить тренировку
            </Title>
          </Group>

          <Text size="sm" c="dimmed" mb={-4}>
            Время: <strong>{selectedHour}:00</strong>
          </Text>

          <Divider />

          <Select
            label="Клиент"
            placeholder="Выберите клиента"
            data={clients.map((c) => ({
              value: c.id,
              label: `${c.name} ${c.lastName ?? ""}${
                c.internalTag ? ` (${c.internalTag})` : ""
              }`,
            }))}
            value={selectedUser}
            onChange={setSelectedUser}
            radius="md"
            size="md"
            withinPortal
          />

          <Checkbox
            label="Разовая оплата"
            checked={isSinglePaid}
            onChange={(event) => setIsSinglePaid(event.currentTarget.checked)}
            radius="md"
            size="md"
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
              У клиента нет активного блока. Чтобы продолжить, выберите «Разовая оплата».
            </Text>
          )}

          <Button
            fullWidth
            radius="xl"
            size="md"
            variant="outline"
            color="dark"
            onClick={onAssign}
            style={{
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            Назначить
          </Button>
        </Stack>
      </Card>
    </Modal>
  );
}
