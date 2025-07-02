import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  variant?: "primary" | "outline";
}

export default function ActionButton({
  children,
  fullWidth,
  leftIcon,
  variant = "primary",
  className,
  disabled,
  ...rest
}: ActionButtonProps) {
  const base =
    "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition rounded-2xl";

  const variants = {
    primary: "bg-pink text-white hover:bg-pink-alt",
    outline: "border border-pink text-pink hover:bg-pink-light bg-white",
  };

  const disabledClasses = "bg-pink-alt text-white opacity-50 cursor-not-allowed";

  return (
    <button
      disabled={disabled}
      className={twMerge(
        base,
        disabled ? disabledClasses : variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {leftIcon && <span className="text-lg">{leftIcon}</span>}
      {children}
    </button>
  );
}
