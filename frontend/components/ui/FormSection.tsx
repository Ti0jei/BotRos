import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={twMerge("space-y-3 w-full", className)}>
      {title && (
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      )}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}
