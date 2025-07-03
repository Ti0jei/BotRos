import { Badge, BadgeProps } from "@mantine/core";

interface StatusBadgeProps extends Omit<BadgeProps, "color"> {
  status: "active" | "pending" | "declined" | "inactive";
}

export default function StatusBadge({ status, ...rest }: StatusBadgeProps) {
  const statusMap: Record<StatusBadgeProps["status"], {
    label: string;
    color: BadgeProps["color"];
    variant: BadgeProps["variant"];
  }> = {
    active:   { label: "Активно", color: "#d6336c", variant: "filled" },
    pending:  { label: "Ожидает", color: "#ffb3c1", variant: "light" },
    declined: { label: "Отменено", color: "gray", variant: "light" },
    inactive: { label: "Не активно", color: "gray", variant: "outline" },
  };

  const { label, color, variant } = statusMap[status];

  return (
    <Badge
      radius="xl"
      size="sm"
      fw={500}
      color={color}
      variant={variant}
      {...rest}
    >
      {label}
    </Badge>
  );
}
