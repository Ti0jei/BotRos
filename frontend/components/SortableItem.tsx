import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Group, ActionIcon } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import { ReactNode } from "react";

export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "manipulation",
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Group align="flex-start" spacing="xs">
        {/* Перетаскивание только за иконку ≡ */}
        <ActionIcon
          variant="transparent"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          style={{ cursor: "grab", marginTop: 4 }}
        >
          <IconGripVertical size={20} />
        </ActionIcon>

        <Box style={{ flex: 1 }}>{children}</Box>
      </Group>
    </Box>
  );
}
