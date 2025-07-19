// frontend/pages/FinishedSinglesPage.tsx
import { Paper, Stack, Text, Title, Box, Group } from '@mantine/core';

interface TrainingRecord {
  id: string;
  date: string;
  hour: number;
  isSinglePaid: boolean;
  attended?: boolean;
}

interface Props {
  trainings: TrainingRecord[];
}

export default function FinishedSinglesPage({ trainings }: Props) {
  const finished = trainings.filter((t) => t.isSinglePaid && t.attended);

  return (
    <Box p="md">
      <Title order={3} mb="md">Завершённые разовые посещения</Title>
      <Stack spacing="sm">
        {finished.length === 0 ? (
          <Text size="sm" c="dimmed">Нет завершённых разовых посещений</Text>
        ) : (
          finished.map((t) => (
            <Paper key={t.id} withBorder radius="md" p="sm">
              <Group position="apart">
                <Text>{new Date(t.date).toLocaleDateString()}</Text>
                <Text c="dimmed">{t.hour}:00</Text>
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
}
