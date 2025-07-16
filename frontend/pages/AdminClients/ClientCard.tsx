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
  onAssign: () => void;
  onToggleExpand: () => void;
  onOpenDrawer: () => void;
  buttonStyle: any;
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
  onAssign,
  onToggleExpand,
  onOpenDrawer,
  buttonStyle,
}: Props) {
  const remaining = block ? block.paidTrainings - block.used : 0;

  return (
    <Card
      withBorder
      radius="xl"
      p={10}
      shadow="xs"
      style={{ position: "relative", paddingTop: 18, paddingBottom: 0 }}
    >
      {/* Иконки */}
      <Box style={{ position: "absolute", top: 8, right: 8 }}>
        <Group spacing={4}>
          <Tooltip label="Питание">
            <ActionIcon
              onClick={onOpenNutrition}
              style={{
                background: "#fff",
                color: "#1a1a1a",
                border: "1px solid #1a1a1a",
                borderRadius: 10,
                width: 24,
                height: 24,
              }}
            >
              <IconChefHat size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Тренировки">
            <ActionIcon
              onClick={onOpenDrawer}
              style={{
                background: "#fff",
                color: "#1a1a1a",
                border: "1px solid #1a1a1a",
                borderRadius: 10,
                width: 24,
                height: 24,
              }}
            >
              <Dumbbell size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>

      <Stack spacing={0}>
        <Text fw={600} size="xs">
          {client.name} {client.lastName ?? ""}
          {client.internalTag && (
            <Text span c="dimmed" size="xs">
              {" "}
              ({client.internalTag})
            </Text>
          )}
        </Text>

        <Text size="xs" c="dimmed">
          {client.age} лет
        </Text>

        <Group spacing={4} mb={isOpen ? 0 : 4}>
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
      </Stack>

      {/* Скрываемая часть */}
      <Collapse in={isOpen} style={{ marginTop: 6 }}>
        <Stack spacing={4}>
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
                История оплат
              </Button>
              <Button
                size="xs"
                styles={buttonStyle}
                leftIcon={<IconPlus size={12} />}
                onClick={onAssign}
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

      {/* Стрелка */}
      <Box style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <ActionIcon
          onClick={onToggleExpand}
          style={{
            background: "#fff",
            border: "1px solid #1a1a1a",
            borderRadius: 10,
            width: 24,
            height: 24,
            color: "#1a1a1a",
          }}
        >
          {isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </ActionIcon>
      </Box>
    </Card>
  );
}
