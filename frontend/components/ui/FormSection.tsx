import { ReactNode } from "react";
import { Title, Text, Stack } from "@mantine/core";
import { twMerge } from "tailwind-merge";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  pinkTitle?: boolean; // 💡 позволяет розовый цвет заголовка
}

export default function FormSection({
  title,
  description,
  children,
  className,
  pinkTitle = false,
}: FormSectionProps) {
  return (
    <Stack spacing="xs" className={twMerge("w-full mb-4", className)}>
      {title && (
        <Title
          order={3}
          size="h5"
          fw={600}
          c={pinkTitle ? "#d6336c" : "dark"}
          className="tracking-tight"
        >
          {title}
        </Title>
      )}
      {description && (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      )}
      <Stack spacing="sm">{children}</Stack>
    </Stack>
  );
}
