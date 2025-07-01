import { ReactNode } from "react";

export default function CardBlock({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#fff0f6] rounded-2xl shadow-md p-4 w-full">
      {children}
    </div>
  );
}
