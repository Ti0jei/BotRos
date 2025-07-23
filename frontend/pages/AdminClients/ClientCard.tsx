import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Box,
  ActionIcon,
  Tooltip,
  Collapse,
  TextInput,
  Button,
} from "@mantine/core";
import {
  IconChefHat,
  IconCash,
  IconGift,
  IconPencil,
  IconPlus,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Dumbbell } from "lucide-react";
import { Client, PaymentBlock } from "./types";
import { useState } from "react";
import AssignModalFromCalendar from "@/pages/AdminSchedule/AssignModalFromCalendar";
import dayjs from "dayjs";

interface Props {
  client: Client;
  block: PaymentBlock | null;
  isEditing: boolean;
  isOpen: boolean;
  internalTagValue: string;
  onTagChange: (val: string) => void;
  onSaveTag: () => void;
  onCancelTag: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onOpenNutrition: () => void;
  onOpenPayments: () => void;
  onOpenHistory: () => void;
  onToggleExpand: () => void;
  onOpenDrawer: () => void;
  buttonStyle: any;
  blocks: Record<string, PaymentBlock | null>;
  clients: Client[];
}

export default function ClientCard({
  client,
  block,
  isEditing,
  isOpen,
  internalTagValue,
  onTagChange,
  onSaveTag,
  onCancelTag,
  onStartEdit,
  onDelete,
  onOpenNutrition,
  onOpenPayments,
  onOpenHistory,
  onToggleExpand,
  onOpenDrawer,
  buttonStyle,
  blocks,
  clients,
}: Props) {
  const remaining = block ? block.paidTrainings - block.used : 0;

  const [assignOpened, setAssignOpened] = useState(false);

  const handleAssignClick = () => {
    localStorage.setItem("assignUserId", client.id);
    localStorage.setItem("assignSinglePaid", "false");
    setAssignOpened(true);
  };

  return (
    <Card withBorder radius="xl" p="md" shadow="xs">
      <Stack spacing={6}>
        {/* Верхняя строка: имя + иконки */}
        <Group position="apart" align="center">
          <Text fw={600} size="sm">
            {client.name} {client.lastName ?? ""}
            {client.internalTag && (
              <Text span c="dimmed" size="xs">
                {" "}({client.internalTag})
              </Text>
            )}
          </Text>

          <Group spacing={6}>
            <Tooltip label="Питание">
              <ActionIcon
                onClick={onOpenNutrition}
                variant="light"
                color="dark"
                radius="xl"
                size="sm"
              >
                <IconChefHat size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Тренировки">
              <ActionIcon
                onClick={onOpenDrawer}
                variant="light"
                color="dark"
                radius="xl"
                size="sm"
              >
                <Dumbbell size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Возраст */}
        <Text size="xs" c="dimmed">
          {client.age} лет
        </Text>

        {/* Бейджи и стрелка — в одной строке */}
        <Group position="apart" align="center">
          <Group spacing={8} align="center">
            <Box
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: block ? "green" : "#999",
              }}
            />
            {block && (
              <>
                <Badge size="xs" color={remaining === 0 ? "red" : "green"}>
                  Осталось: {remaining}
                </Badge>
                <Badge size="xs" color="gray">
                  Цена: {block.pricePerTraining} ₽
                </Badge>
              </>
            )}
          </Group>

          <ActionIcon
            onClick={onToggleExpand}
            variant="light"
            color="dark"
            radius="xl"
            size="sm"
          >
            {isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </ActionIcon>
        </Group>

        {/* Раскрывающийся блок */}
        <Collapse in={isOpen}>
          <Stack spacing={6} mt="sm">
            {isEditing ? (
              <>
                <TextInput
                  size="xs"
                  value={internalTagValue}
                  onChange={(e) => onTagChange(e.currentTarget.value)}
                  placeholder="Доп. имя"
                  radius="xl"
                />
                <Group grow>
                  <Button size="xs" onClick={onSaveTag} styles={buttonStyle}>
                    Сохранить
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    color="gray"
                    onClick={onCancelTag}
                    styles={buttonStyle}
                  >
                    Отмена
                  </Button>
                </Group>
              </>
            ) : (
              <>
                <Group grow>
                  <Button
                    size="xs"
                    styles={buttonStyle}
                    leftIcon={<IconCash size={12} />}
                    onClick={onOpenPayments}
                  >
                    Оплата
                  </Button>
                  <Button
                    size="xs"
                    styles={buttonStyle}
                    leftIcon={<IconGift size={12} />}
                    onClick={onOpenHistory}
                  >
                    Запись
                  </Button>
                </Group>
                <Button
                  size="xs"
                  styles={buttonStyle}
                  leftIcon={<IconPlus size={12} />}
                  onClick={handleAssignClick}
                >
                  Записать на тренировку
                </Button>
                <Group grow>
                  <Button
                    size="xs"
                    styles={buttonStyle}
                    leftIcon={<IconPencil size={12} />}
                    onClick={onStartEdit}
                  >
                    Псевдоним
                  </Button>
                  <Button
                    size="xs"
                    styles={buttonStyle}
                    color="red"
                    leftIcon={<IconTrash size={12} />}
                    onClick={onDelete}
                  >
                    Удалить
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Collapse>
      </Stack>

      <AssignModalFromCalendar
        opened={assignOpened}
        onClose={() => setAssignOpened(false)}
        clients={clients}
        blocks={blocks}
        selectedHour={null}
        selectedDate={dayjs()}
        onSuccess={() => setAssignOpened(false)}
      />
    </Card>
  );
}