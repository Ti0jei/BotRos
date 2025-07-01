import { ReactNode } from "react";

export default function CardBlock({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full">
      {children}
    </div>
  );
}
