// frontend/pages/FinishedBlocksPage.tsx
import { Paper, Stack, Text, Title, Box } from '@mantine/core';

interface PaymentBlock {
  id: string;
  paidAt: string;
  paidTrainings: number;
  used: number;
  pricePerTraining: number;
  active: boolean;
}

interface Props {
  blocks: PaymentBlock[];
}

export default function FinishedBlocksPage({ blocks }: Props) {
  const finished = blocks.filter((b) => !b.active);

  return (
    <Box p="md">
      <Title order={3} mb="md">Завершённые абонементы</Title>
      <Stack spacing="sm">
        {finished.length === 0 ? (
          <Text size="sm" c="dimmed">Нет завершённых абонементов</Text>
        ) : (
          finished.map((block) => (
            <Paper key={block.id} withBorder radius="md" p="md">
              <Text fw={500}>
                Оплата от {new Date(block.paidAt).toLocaleDateString()}
              </Text>
              <Text size="sm" c="dimmed">
                {block.paidTrainings} тренировок • {block.used} использовано • {block.pricePerTraining} ₽
              </Text>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
}
