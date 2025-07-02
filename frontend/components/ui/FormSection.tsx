import { ReactNode } from "react";

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
    <div className={`space-y-2 w-full ${className || ""}`}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      )}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div>{children}</div>
    </div>
  );
}
