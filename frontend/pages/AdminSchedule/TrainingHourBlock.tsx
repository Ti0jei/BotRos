import { Box, Group, Text, Button } from "@mantine/core";
import { Training, PaymentBlock } from "./types";
import TrainingCard from "./TrainingCard";
import dayjs from "dayjs";

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
  const isCurrentHour = date.isToday() && hour === dayjs().hour();

  const outlineButtonStyle = {
    root: {
      color: "#000",
      border: "1px solid #000",
      borderRadius: 12,
      backgroundColor: "#fff",
      fontWeight: 500,
      transition: "background 0.2s",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  return (
    <Box
      style={{
        border: isCurrentHour ? "2px solid #000" : "1px solid #ddd",
        borderRadius: 16,
        padding: 12,
        backgroundColor: isCurrentHour ? "#fff" : "#fcfcfc",
      }}
    >
      <Group position="apart" mb={6}>
        <Text fw={600} size="md" c="#1a1a1a">
          {hour}:00 {isCurrentHour && "⏰"}
        </Text>
        <Button size="xs" styles={outlineButtonStyle} onClick={onOpenAssign}>
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
