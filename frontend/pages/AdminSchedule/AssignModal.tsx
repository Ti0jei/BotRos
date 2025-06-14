import {
  Button,
  Checkbox,
  Modal,
  Select,
  Text,
} from '@mantine/core';
import { PaymentBlock } from './types';

interface AssignModalProps {
  opened: boolean;
  onClose: () => void;
  onAssign: () => void;
  clients: {
    id: string;
    name: string;
    lastName?: string | null;
    internalTag?: string | null;
  }[];
  selectedUser: string | null;
  setSelectedUser: (id: string | null) => void;
  isSinglePaid: boolean;
  setIsSinglePaid: (v: boolean) => void;
  selectedHour: number | null;
  blocks: Record<string, PaymentBlock | null>; // ⬅️ добавляем сюда блоки
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
  const block = selectedUser ? blocks[selectedUser] : null;
  const hasBlock = block && block.paidTrainings > block.used;
  const shouldWarn = selectedUser && !hasBlock && !isSinglePaid;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Назначить тренировку на ${selectedHour}:00`}
    >
      <Select
        label="Клиент"
        placeholder="Выберите клиента"
        data={clients.map((c) => ({
          value: c.id,
          label: `${c.name} ${c.lastName ?? ''}${c.internalTag ? ` (${c.internalTag})` : ''}`,
        }))}
        value={selectedUser}
        onChange={setSelectedUser}
      />

      <Checkbox
        mt="md"
        label="Разовая оплата"
        checked={isSinglePaid}
        onChange={(event) => setIsSinglePaid(event.currentTarget.checked)}
      />

      {shouldWarn && (
        <Text color="red" mt="sm" size="sm">
          У клиента нет активного блока. Выберите "Разовая оплата", чтобы назначить тренировку.
        </Text>
      )}

      <Button mt="md" fullWidth onClick={onAssign}>
        Назначить
      </Button>
    </Modal>
  );
}
