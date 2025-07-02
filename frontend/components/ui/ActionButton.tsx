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
  ...rest
}: ActionButtonProps) {
  const base =
    "flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition";

  const variants = {
    primary: "bg-[#f06595] text-white hover:bg-[#f4b6c2]",
    outline:
      "border border-[#f06595] text-[#f06595] hover:bg-[#fff0f6] bg-white",
  };

  return (
    <button
      className={twMerge(
        base,
        variants[variant],
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
