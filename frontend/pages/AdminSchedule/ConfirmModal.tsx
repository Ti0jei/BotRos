import { Modal, Text, Group, Button, Card, Stack, Title } from "@mantine/core";

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
          <Title order={4}>Подтверждение</Title>

          <Text size="sm" c="dimmed">
            {message}
          </Text>

          <Group grow>
            <Button
              variant="outline"
              color="gray"
              radius="xl"
              onClick={onClose}
              style={{ fontWeight: 500 }}
            >
              Нет
            </Button>
            <Button
              variant="outline"
              color="red"
              radius="xl"
              onClick={onConfirm}
              style={{ fontWeight: 500 }}
            >
              Да
            </Button>
          </Group>
        </Stack>
      </Card>
    </Modal>
  );
}
