import { Paper, Stack, Title, Text, PaperProps } from '@mantine/core';

interface FormSectionProps extends PaperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export default function FormSection({ title, description, children, ...props }: FormSectionProps) {
  return (
    <div style={{ width: '100%', padding: 16 }}>
      <Paper
        withBorder
        radius="xl"
        p="xl"
        style={{
          width: '100%',
          maxWidth: 500,
          margin: '0 auto',
          backgroundColor: '#fff0f6',
        }}
        {...props}
      >
        <Stack spacing="md">
          {title && <Title order={3}>{title}</Title>}
          {description && <Text color="dimmed" size="sm">{description}</Text>}
          {children}
        </Stack>
      </Paper>
    </div>
  );
}
