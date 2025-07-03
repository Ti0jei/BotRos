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
  const stylesByColorStyle = {
    primary: {
      color: "#d6336c",
      hover: "#ffe3ec",
    },
    danger: {
      color: "#c92a2a",
      hover: "#ffe3e3",
    },
    gradient: {
      gradient: "linear-gradient(to right, #ff8ca3, #ff4d6d)",
      hover: "linear-gradient(to right, #ff6b91, #ff1f4c)",
      color: "white",
    },
  };

  const current = stylesByColorStyle[colorStyle];

  const getBackground = () => {
    if (colorStyle === "gradient") return current.gradient;
    if (variant === "filled") return current.color;
    if (variant === "light") return "white";
    return "transparent";
  };

  const getTextColor = () => {
    if (colorStyle === "gradient") return current.color;
    if (variant === "filled") return "white";
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
              colorStyle === "gradient"
                ? current.hover
                : variant === "outline" || variant === "light"
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
