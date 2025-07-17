// frontend/pages/AdminClients/ClientCardHeader.tsx
import { Box, Group, Text } from "@mantine/core";
import { PaymentBlock } from "./types";

interface Props {
  name: string;
  lastName?: string | null;
  internalTag?: string | null;
  age: number;
  block: PaymentBlock | null;
}

export default function ClientCardHeader({
  name,
  lastName,
  internalTag,
  age,
  block,
}: Props) {
  return (
    <>
      <Group position="apart">
        <Text fw={600}>
          {name} {lastName ?? ""}
          {internalTag && (
            <Text span c="dimmed">
              {" "}
              ({internalTag})
            </Text>
          )}
        </Text>
        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: block ? "green" : "#999",
          }}
        />
      </Group>

      <Text size="sm" c="dimmed">
        {age} лет
      </Text>
    </>
  );
}
