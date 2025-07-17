// components/CollapsibleCard.tsx

import { useState } from "react";
import {
  Card,
  Group,
  Text,
  Collapse,
  Box,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

interface CollapsibleCardProps {
  title: string;
  badgeText?: string;
  badgeColor?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function CollapsibleCard({
  title,
  badgeText,
  badgeColor = "gray",
  children,
  actions,
}: CollapsibleCardProps) {
  const [opened, setOpened] = useState(false);
  const toggle = () => setOpened((o) => !o);

  return (
    <Card
      withBorder
      shadow="xs"
      radius="md"
      p="sm"
      style={{ position: "relative", paddingBottom: 44 }}
    >
      <Group position="apart" align="center" mb="xs">
        <Group spacing="sm">
          <Text fw={500}>{title}</Text>
          {badgeText && <Badge color={badgeColor}>{badgeText}</Badge>}
        </Group>
      </Group>

      {actions && (
        <Group grow spacing="sm" mb="xs">
          {actions}
        </Group>
      )}

      <Collapse in={opened}>
        <Box pt="xs">{children}</Box>
      </Collapse>

      <ActionIcon
        onClick={toggle}
        variant="outline"
        size="md"
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          borderColor: "#1a1a1a",
          color: "#1a1a1a",
          backgroundColor: "#fff",
        }}
      >
        {opened ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
      </ActionIcon>
    </Card>
  );
}
