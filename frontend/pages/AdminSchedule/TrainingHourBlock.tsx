import { Box, Group, Text, Button } from '@mantine/core';
import { Training, PaymentBlock } from './types';
import TrainingCard from './TrainingCard';
import dayjs from 'dayjs';

export default function TrainingHourBlock({
  hour,
  date,
  trainings,
  blocks,
  onOpenAssign,
  onDelete,
  onAttend,
}: {
  hour: number;
  date: dayjs.Dayjs;
  trainings: Training[];
  blocks: Record<string, PaymentBlock | null>;
  onOpenAssign: () => void;
  onDelete: (id: string) => void;
  onAttend: (id: string, value: boolean) => void;
}) {
  const highlight = date.isToday() && hour === dayjs().hour();

  return (
    <Box
      style={{
        backgroundColor: highlight ? '#fffbe6' : 'transparent',
        borderRadius: 8,
        padding: 4,
      }}
    >
      <Group position="apart" mb={4}>
        <Text fw={600} size="md" style={{ minWidth: 60 }}>
          {hour}:00
        </Text>
        <Button size="xs" color="blue" variant="light" onClick={onOpenAssign}>
          Назначить
        </Button>
      </Group>

      {trainings.map((t) => (
        <TrainingCard
          key={t.id}
          training={t}
          block={blocks[t.userId] ?? null}
          onDelete={() => onDelete(t.id)}
          onAttend={(val) => onAttend(t.id, val)}
        />
      ))}
    </Box>
  );
}
