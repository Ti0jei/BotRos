import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Modal,
  Select,
  Text,
  Stack,
} from '@mantine/core';
import { PaymentBlock, User } from './types';

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
      title={`Назначить тренировку на ${selectedHour}:00`}
    >
      <Stack>
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

        {showWarning && (
          <Text color="red" size="sm">
            У клиента нет активного блока. Поставьте галочку "Разовая оплата", чтобы назначить тренировку.
          </Text>
        )}

        <Checkbox
          label="Разовая оплата"
          checked={isSinglePaid}
          onChange={(event) => setIsSinglePaid(event.currentTarget.checked)}
        />

        <Button fullWidth mt="sm" onClick={onAssign}>
          Назначить
        </Button>
      </Stack>
    </Modal>
  );
}
  