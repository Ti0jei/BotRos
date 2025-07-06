import { Button, ButtonProps } from "@mantine/core";
import { ReactNode } from "react";

interface ActionButtonProps extends ButtonProps {
  children: ReactNode;
  leftIcon?: ReactNode;
  colorStyle?: "black" | "gray" | "danger";
}

export default function ActionButton({
  children,
  fullWidth = true,
  radius = "xl",
  size = "md",
  variant = "light",
  colorStyle = "black",
  leftIcon,
  ...rest
}: ActionButtonProps) {
  const stylesByColorStyle = {
    black: {
      color: "#000000",
      text: "#ffffff",
      hover: "#222222",
    },
    gray: {
      color: "#f2f2f2",
      text: "#111111",
      hover: "#e6e6e6",
    },
    danger: {
      color: "#c92a2a",
      text: "#ffffff",
      hover: "#a51111",
    },
  };

  // ✅ Защита от некорректного colorStyle
  const current = stylesByColorStyle[colorStyle] ?? stylesByColorStyle.black;

  const getBackground = () => {
    if (variant === "filled") return current.color;
    if (variant === "light") return "#ffffff";
    return "transparent";
  };

  const getTextColor = () => {
    if (variant === "filled") return current.text;
    return current.color;
  };

  const getBorder = () => {
    if (variant === "outline") return `1px solid ${current.color}`;
    return "transparent";
  };

  return (
    <Button
      leftIcon={leftIcon}
      fullWidth={fullWidth}
      radius={radius}
      size={size}
      variant={variant}
      styles={{
        root: {
          background: getBackground(),
          color: getTextColor(),
          border: getBorder(),
          transition: "all 0.2s ease",
          fontWeight: 500,
          "&:hover": {
            background:
              variant === "outline" || variant === "light"
                ? current.hover
                : variant === "filled"
                ? current.hover
                : undefined,
          },
        },
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}
