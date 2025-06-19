import { Paper, Text, Badge, Group, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import dayjs from 'dayjs';
import { Training, PaymentBlock } from './types';

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
  const getCardColor = (status: string) => {
    if (status === 'CONFIRMED') return '#e6ffec';
    if (status === 'DECLINED') return '#ffe6e6';
    return '#f1f3f5';
  };

  const getUserIcon = () => {
    if (training.isSinglePaid) return '💸';
    if (!block) return '📛';
    return '🧍';
  };

  const handleDeleteWithConfirm = () => {
    modals.openConfirmModal({
      title: 'Подтверждение',
      children: (
        <Text size="sm">Вы точно хотите отменить эту тренировку?</Text>
      ),
      labels: { confirm: 'Да, отменить', cancel: 'Нет' },
      confirmProps: { color: 'red' },
      onConfirm: onDelete,
    });
  };

  return (
    <Paper
      withBorder
      shadow="xs"
      radius="md"
      p="sm"
      mb="xs"
      style={{ backgroundColor: getCardColor(training.status) }}
    >
      <Group position="apart" mb="xs">
        <Text fw={500}>
          {getUserIcon()} {training.user.name} {training.user.lastName ?? ''}{' '}
          {training.user.internalTag && (
            <Text span color="dimmed">
              ({training.user.internalTag})
            </Text>
          )}
        </Text>
        <Badge
          color={
            training.status === 'CONFIRMED'
              ? 'green'
              : training.status === 'DECLINED'
              ? 'red'
              : 'gray'
          }
        >
          {training.status === 'CONFIRMED'
            ? 'Придёт'
            : training.status === 'DECLINED'
            ? 'Не придёт'
            : 'Ожидается'}
        </Badge>
      </Group>

      <Group grow spacing="xs">
        {dayjs(training.date).isSameOrBefore(dayjs(), 'day') && (
          <>
            <Button
              size="xs"
              color="green"
              variant={training.attended === true ? 'filled' : 'light'}
              onClick={() => onAttend(true)}
            >
              Был
            </Button>
            <Button
              size="xs"
              color="red"
              variant={training.attended === false ? 'filled' : 'light'}
              onClick={() => onAttend(false)}
            >
              Прогул
            </Button>
          </>
        )}
        <Button
          size="xs"
          color="gray"
          variant="light"
          onClick={handleDeleteWithConfirm}
        >
          Отмена
        </Button>
      </Group>
    </Paper>
  );
}
