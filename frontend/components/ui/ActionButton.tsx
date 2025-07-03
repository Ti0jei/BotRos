import { Button, ButtonProps } from "@mantine/core";
import { ReactNode } from "react";

interface ActionButtonProps extends ButtonProps {
  children: ReactNode;
  leftIcon?: ReactNode;
  colorStyle?: "primary" | "danger" | "gradient";
}

export default function ActionButton({
  children,
  fullWidth = true,
  radius = "xl",
  size = "md",
  variant = "light",
  colorStyle = "primary",
  leftIcon,
  ...rest
}: ActionButtonProps) {
  let color = "#d6336c"; // основной розовый
  let bg = "white";
  let hover = "#ffe3ec";

  if (colorStyle === "danger") {
    color = "#c92a2a";
    hover = "#ffe3e3";
  }

  if (colorStyle === "gradient") {
    bg = "linear-gradient(to right, #ff8ca3, #ff4d6d)";
    color = "white";
  }

  return (
    <Button
      leftIcon={leftIcon}
      fullWidth={fullWidth}
      radius={radius}
      size={size}
      variant={variant}
      styles={(theme) => ({
        root: {
          background:
            colorStyle === "gradient" ? bg : variant === "filled" ? color : bg,
          color:
            colorStyle === "gradient"
              ? "white"
              : variant === "filled"
              ? "white"
              : color,
          border:
            variant === "outline" ? `1px solid ${color}` : "transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            background:
              variant === "outline" || variant === "light" ? hover : undefined,
          },
        },
      })}
      {...rest}
    >
      {children}
    </Button>
  );
}
