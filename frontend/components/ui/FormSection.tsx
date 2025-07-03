import { ReactNode } from "react";
import { Title, Text, Stack } from "@mantine/core";
import { twMerge } from "tailwind-merge";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <Stack spacing="xs" className={twMerge("w-full", className)}>
      {title && (
        <Title order={3} size="h5" fw={600} c="dark">
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
