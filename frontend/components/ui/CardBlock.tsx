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
      className="bg-pink-light"
      {...rest}
    >
      {children}
    </Card>
  );
}
