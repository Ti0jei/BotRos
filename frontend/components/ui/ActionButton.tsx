// ActionButton.tsx
import { Button, ButtonProps } from '@mantine/core';

export default function ActionButton(props: ButtonProps) {
  return (
    <Button
      radius="xl"
      size="md"
      variant="filled"
      color="pink"
      fullWidth
      {...props}
    />
  );
}
