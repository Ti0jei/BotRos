import { ReactNode } from "react";
import { Title, Text, Stack } from "@mantine/core";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  spacing?: number;
}

export default function FormSection({
  title,
  description,
  children,
  spacing = 8,
}: FormSectionProps) {
  return (
    <Stack spacing={spacing} style={{ width: "100%", marginBottom: "1rem" }}>
      {title && (
        <Title
          order={3}
          size="h5"
          fw={600}
          c="#111111"
          style={{ letterSpacing: "-0.015em" }}
        >
          {title}
        </Title>
      )}
      {description && (
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      )}
      <Stack spacing="sm">{children}</Stack>
    </Stack>
  );
}
