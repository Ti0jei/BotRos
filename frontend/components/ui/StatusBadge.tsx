import { twMerge } from "tailwind-merge";

interface StatusBadgeProps {
  status: "active" | "pending" | "declined";
  className?: string;
}

const statusMap = {
  active: {
    label: "Активно",
    classes: "bg-pink text-white",
  },
  pending: {
    label: "Ожидает",
    classes: "bg-pink-light text-pink border border-pink",
  },
  declined: {
    label: "Отменено",
    classes: "bg-gray-100 text-gray-500",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, classes } = statusMap[status];

  return (
    <span
      className={twMerge(
        "inline-block px-2 py-1 text-xs font-semibold rounded-xl transition",
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}
