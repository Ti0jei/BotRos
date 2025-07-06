import { Card, CardProps } from "@mantine/core";
import { ReactNode } from "react";

interface CardBlockProps extends CardProps {
  children: ReactNode;
}

export default function CardBlock({ children, ...rest }: CardBlockProps) {
  return (
    <Card
      shadow="xs"
      radius="xl"
      p="lg"
      withBorder
      styles={{
        root: {
          backgroundColor: "#ffffff",
          color: "#111111",
          borderColor: "#eaeaea",
        },
      }}
      {...rest}
    >
      {children}
    </Card>
  );
}
