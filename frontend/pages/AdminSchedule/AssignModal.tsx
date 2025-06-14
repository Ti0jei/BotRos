import {
    Button,
    Checkbox,
    Modal,
    Select,
  } from '@mantine/core';
  
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
  }: AssignModalProps) {
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
        <Button mt="md" fullWidth onClick={onAssign}>
          Назначить
        </Button>
      </Modal>
    );
  }
  