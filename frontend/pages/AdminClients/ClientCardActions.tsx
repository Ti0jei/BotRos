// frontend/pages/AdminClients/ClientCardActions.tsx
import { useState } from "react";
import {
  Button,
  Collapse,
  Group,
  Stack,
  TextInput,
} from "@mantine/core";
import {
  IconCash,
  IconGift,
  IconPlus,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { PaymentBlock } from "./types";

interface Props {
  isOpen: boolean;
  isEditing: boolean;
  block: PaymentBlock | null;
  internalTagValue: string;
  setInternalTagValue: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
  onHistory: () => void;
  onPayment: () => void;
}

export default function ClientCardActions({
  isOpen,
  isEditing,
  block,
  internalTagValue,
  setInternalTagValue,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onAssign,
  onHistory,
  onPayment,
}: Props) {
  const buttonStyle = {
    root: {
      color: "#1a1a1a",
      border: "1px solid #1a1a1a",
      borderRadius: 12,
      fontWeight: 500,
      backgroundColor: "#fff",
      transition: "background 0.2s",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  return (
    <Collapse in={isOpen}>
      {isEditing ? (
        <Stack spacing="xs" mt="xs">
          <TextInput
            value={internalTagValue}
            onChange={(e) => setInternalTagValue(e.currentTarget.value)}
            placeholder="Доп. имя"
            radius="xl"
          />
          <Group grow mt="xs">
            <Button onClick={onSave} styles={buttonStyle}>
              Сохранить
            </Button>
            <Button
              variant="outline"
              color="gray"
              onClick={onCancel}
              styles={buttonStyle}
            >
              Отмена
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack spacing="xs" mt="xs">
          <Button
            styles={buttonStyle}
            leftIcon={<IconCash size={16} />}
            onClick={onPayment}
          >
            Оплата
          </Button>
          <Button
            styles={buttonStyle}
            leftIcon={<IconGift size={16} />}
            onClick={onHistory}
          >
            Запись
          </Button>
          <Button
            styles={buttonStyle}
            leftIcon={<IconPlus size={16} />}
            onClick={onAssign}
          >
            Записать на тренировку
          </Button>
          <Group grow mt={6}>
            <Button
              styles={buttonStyle}
              leftIcon={<IconPencil size={16} />}
              onClick={onEdit}
            >
              Псевдоним
            </Button>
            <Button
              styles={buttonStyle}
              color="red"
              leftIcon={<IconTrash size={16} />}
              onClick={onDelete}
            >
              Удалить
            </Button>
          </Group>
        </Stack>
      )}
    </Collapse>
  );
}
