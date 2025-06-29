// CardBlock.tsx
import { Card, Group, Text, Box, CardProps } from '@mantine/core';

interface CardBlockProps extends CardProps {
  title: string;
  description?: string;
  rightSection?: React.ReactNode;
}

export default function CardBlock({ title, description, rightSection, children, ...props }: CardBlockProps) {
  return (
    <Card {...props}>
      <Group position="apart" mb="sm">
        <Text weight={600}>{title}</Text>
        {rightSection}
      </Group>
      {description && <Text size="sm" color="dimmed">{description}</Text>}
      <Box mt="md">{children}</Box>
    </Card>
  );
}
