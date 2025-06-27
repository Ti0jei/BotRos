import { Box, Group, Text, Button } from '@mantine/core';
import { Training, PaymentBlock } from './types';
import TrainingCard from './TrainingCard';
import dayjs from 'dayjs';

interface Props {
  hour: number;
  date: dayjs.Dayjs;
  trainings: Training[];
  blocks: Record<string, PaymentBlock | null>;
  onOpenAssign: () => void;
  onDelete: (id: string) => void;
  onAttend: (id: string, value: boolean) => void;
}

export default function TrainingHourBlock({
  hour,
  date,
  trainings,
  blocks,
  onOpenAssign,
  onDelete,
  onAttend,
}: Props) {
  const highlight = date.isToday() && hour === dayjs().hour();

  return (
    <Box
      style={{
        backgroundColor: highlight ? '#fff3bf' : 'transparent', // более насыщенный желтый
        border: highlight ? '2px solid #fab005' : undefined,    // оранжевая рамка
        borderRadius: 8,
        padding: 6,
        boxShadow: highlight ? '0 0 8px rgba(255, 165, 0, 0.4)' : undefined,
      }}
    >
      <Group position="apart" mb={4}>
        <Text fw={600} size="md" style={{ minWidth: 60 }}>
          {hour}:00 {highlight && '⏰'}
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
