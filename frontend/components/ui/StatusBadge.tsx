import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface StatusBadgeProps {
  status: "active" | "pending" | "declined";
  className?: string;
}

const statusMap = {
  active: {
    label: "Активно",
    classes: "bg-[#f06595] text-white",
  },
  pending: {
    label: "Ожидает",
    classes: "bg-[#fff0f6] text-[#f06595] border border-[#f06595]",
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
        "inline-block px-2 py-1 text-xs font-semibold rounded-md",
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}
