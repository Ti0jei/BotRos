import { Paper, Text, Badge, Group, Button, Box, Stack } from "@mantine/core";
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

  const showProgramDetails = () => {
    if (!training.template || !training.template.exercises?.length) return;

    modals.open({
      title: `Программа тренировок: ${training.template.title}`,
      children: (
        <Stack spacing={4}>
          {training.template.exercises.map((ex, idx) => (
            <Box key={idx}>
              <Text size="sm">
                • <b>{ex.definition?.name || "Упражнение"}</b> — {ex.weight} кг, {ex.sets}×{ex.reps}
              </Text>
              {ex.comment && (
                <Text size="xs" c="dimmed" ml={16}>
                  Комментарий: {ex.comment}
                </Text>
              )}
            </Box>
          ))}
        </Stack>
      ),
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
        <div>
          <Text fw={600}>
            {getUserIcon()} {training.user.name} {training.user.lastName ?? ""}
            {training.user.internalTag && (
              <Text span c="dimmed">
                {" "}
                ({training.user.internalTag})
              </Text>
            )}
          </Text>
          {training.template && (
            <Text
              size="xs"
              c="dimmed"
              mt={4}
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={showProgramDetails}
            >
              🏋️‍♀️ Программа тренировок: {training.template.title}
            </Text>
          )}
        </div>

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
