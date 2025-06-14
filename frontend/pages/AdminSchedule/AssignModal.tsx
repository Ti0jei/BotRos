import { useEffect, useState } from 'react';
import { Button, Checkbox, Modal, Select, Text } from '@mantine/core';
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
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // при изменении выбранного клиента или галочки — убираем ошибку
    setShowError(false);
  }, [selectedUser, isSinglePaid]);

  const hasBlock = selectedUser && blocks[selectedUser]?.paidTrainings > blocks[selectedUser]?.used;

  const handleAssign = () => {
    if (!hasBlock && !isSinglePaid) {
      setShowError(true);
    } else {
      onAssign();
    }
  };

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

      {showError && (
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

      <Button mt="md" fullWidth onClick={handleAssign}>
        Назначить
      </Button>
    </Modal>
  );
}
