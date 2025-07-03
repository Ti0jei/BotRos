import { Button, ButtonProps } from "@mantine/core";
import { ReactNode } from "react";

interface ActionButtonProps extends ButtonProps {
  children: ReactNode;
  leftIcon?: ReactNode;
}

export default function ActionButton({
  children,
  fullWidth = true,
  leftIcon,
  radius = "xl",
  size = "md",
  variant = "filled",
  ...rest
}: ActionButtonProps) {
  return (
    <Button
      leftIcon={leftIcon}
      fullWidth={fullWidth}
      radius={radius}
      size={size}
      variant={variant}
      {...rest}
    >
      {children}
    </Button>
  );
}
