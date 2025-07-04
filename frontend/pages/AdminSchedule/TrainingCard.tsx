import { Paper, Text, Badge, Group, Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import dayjs from "dayjs";
import { Training, PaymentBlock } from "./types";

export default function TrainingCard({
  training,
  block,
  onDelete,
  onAttend,
}: {
  training: Training;
  block: PaymentBlock | null;
  onDelete: () => void;
  onAttend: (attended: boolean) => void;
}) {
  const getUserIcon = () => {
    if (training.isSinglePaid) return "💸";
    if (!block) return "📛";
    return "🧍";
  };

  const handleDeleteWithConfirm = () => {
    modals.openConfirmModal({
      title: "Подтверждение",
      children: (
        <Text size="sm">Вы точно хотите отменить эту тренировку?</Text>
      ),
      labels: { confirm: "Да, отменить", cancel: "Нет" },
      confirmProps: { color: "red" },
      onConfirm: onDelete,
    });
  };

  const baseButton = {
    root: {
      fontWeight: 500,
      borderRadius: 12,
      transition: "background 0.2s",
    },
  };

  const attendanceStyle = (active: boolean, color: string) => ({
    root: {
      ...baseButton.root,
      color: active ? "#fff" : color,
      backgroundColor: active ? color : "#fff",
      border: `1px solid ${color}`,
      "&:hover": {
        backgroundColor: active ? color : "#f2f2f2",
      },
    },
  });

  const outlineStyle = {
    root: {
      ...baseButton.root,
      color: "#000",
      border: "1px solid #000",
      backgroundColor: "#fff",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  return (
    <Paper withBorder radius="xl" p="md" shadow="xs">
      <Group position="apart" mb="xs">
        <Text fw={600}>
          {getUserIcon()} {training.user.name} {training.user.lastName ?? ""}
          {training.user.internalTag && (
            <Text span c="dimmed">
              {" "}
              ({training.user.internalTag})
            </Text>
          )}
        </Text>

        <Badge
          size="sm"
          color={
            training.status === "CONFIRMED"
              ? "green"
              : training.status === "DECLINED"
              ? "red"
              : "gray"
          }
          variant="light"
        >
          {training.status === "CONFIRMED"
            ? "Придёт"
            : training.status === "DECLINED"
            ? "Не придёт"
            : "Ожидается"}
        </Badge>
      </Group>

      <Group grow spacing="xs">
        {dayjs(training.date).isSameOrBefore(dayjs(), "day") && (
          <>
            <Button
              size="xs"
              styles={attendanceStyle(training.attended === true, "#2f9e44")}
              onClick={() => onAttend(true)}
            >
              Был
            </Button>
            <Button
              size="xs"
              styles={attendanceStyle(training.attended === false, "#c92a2a")}
              onClick={() => onAttend(false)}
            >
              Прогул
            </Button>
          </>
        )}
        <Button
          size="xs"
          styles={outlineStyle}
          onClick={handleDeleteWithConfirm}
        >
          Отмена
        </Button>
      </Group>
    </Paper>
  );
}
