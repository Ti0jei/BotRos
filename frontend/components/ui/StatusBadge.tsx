import { Badge, BadgeProps } from "@mantine/core";

interface StatusBadgeProps extends Omit<BadgeProps, "color"> {
  status: "active" | "pending" | "declined" | "inactive";
}

export default function StatusBadge({ status, ...rest }: StatusBadgeProps) {
  const statusMap: Record<StatusBadgeProps["status"], {
    label: string;
    color: string;
    variant: BadgeProps["variant"];
  }> = {
    active:   { label: "Активно",   color: "#111111", variant: "filled" },
    pending:  { label: "Ожидает",   color: "#888888", variant: "light" },
    declined: { label: "Отменено",  color: "#cccccc", variant: "light" },
    inactive: { label: "Не активно",color: "#aaaaaa", variant: "outline" },
  };

  const { label, color, variant } = statusMap[status];

  return (
    <Badge
      radius="xl"
      size="sm"
      fw={500}
      color={color}
      variant={variant}
      styles={{
        root: {
          textTransform: "none",
          color: variant === "filled" ? "#ffffff" : "#111111",
          backgroundColor: variant === "filled" ? color : "transparent",
          borderColor: variant === "outline" ? color : "transparent",
        },
      }}
      {...rest}
    >
      {label}
    </Badge>
  );
}
