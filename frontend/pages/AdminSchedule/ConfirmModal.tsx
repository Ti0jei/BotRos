import { Modal, Text, Group, Button } from '@mantine/core';

export default function ConfirmModal({
  opened,
  onClose,
  message,
  onConfirm,
}: {
  opened: boolean;
  onClose: () => void;
  message: string;
  onConfirm: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Подтверждение">
      <Text mb="md">{message}</Text>
      <Group grow>
        <Button color="gray" variant="light" onClick={onClose}>
          Нет
        </Button>
        <Button color="green" onClick={onConfirm}>
          Да
        </Button>
      </Group>
    </Modal>
  );
}
