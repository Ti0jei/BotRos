import { Card, CardProps } from "@mantine/core";
import { ReactNode } from "react";

interface CardBlockProps extends CardProps {
  children: ReactNode;
}

export default function CardBlock({ children, ...rest }: CardBlockProps) {
  return (
    <Card
      shadow="sm"
      radius="xl"
      p="lg"
      withBorder
      className="bg-gradient-to-b from-[#ffd6e0] to-[#ff8ca3] text-black"
      {...rest}
    >
      {children}
    </Card>
  );
}
