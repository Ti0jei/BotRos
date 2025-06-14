import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Modal,
  Select,
  Text,
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
  const [shouldWarn, setShouldWarn] = useState(false);

  useEffect(() => {
    if (!selectedUser) return;

    const block = blocks[selectedUser];
    const hasBlock = block && block.paidTrainings > block.used;
    setShouldWarn(!hasBlock && !isSinglePaid);
  }, [selectedUser, isSinglePaid, blocks]);

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

      {shouldWarn && (
        <Text color="red" size="sm" mt="xs">
          У клиента нет активного блока. Поставьте галочку "Разовая оплата", чтобы назначить тренировку.
        </Text>
      )}

      <Checkbox
        mt="md"
        label="Разовая оплата"
        checked={isSinglePaid}
        onChange={(event) => setIsSinglePaid(event.currentTarget.checked)}
      />

      <Button mt="md" fullWidth onClick={onAssign}>
        Назначить
      </Button>
    </Modal>
  );
}
