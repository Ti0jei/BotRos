import { Badge, BadgeProps } from "@mantine/core";

interface StatusBadgeProps extends Omit<BadgeProps, "color"> {
  status: "active" | "pending" | "declined";
}

export default function StatusBadge({ status, ...rest }: StatusBadgeProps) {
  const statusMap: Record<StatusBadgeProps["status"], { label: string; color: BadgeProps["color"]; variant?: BadgeProps["variant"] }> = {
    active: { label: "Активно", color: "pink", variant: "filled" },
    pending: { label: "Ожидает", color: "pink", variant: "light" },
    declined: { label: "Отменено", color: "gray", variant: "light" },
  };

  const { label, color, variant } = statusMap[status];

  return (
    <Badge
      radius="xl"
      size="sm"
      color={color}
      variant={variant}
      {...rest}
    >
      {label}
    </Badge>
  );
}
