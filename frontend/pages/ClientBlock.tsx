import { useEffect, useState } from "react";
import { IconHome, IconArrowLeft } from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  Card,
  Stack,
  Center,
  Text,
  Loader,
  Group,
  Title,
  Divider,
} from "@mantine/core";

import { getToken } from "../utils/auth";
import ActionButton from "@/components/ui/ActionButton";
import StatusBadge from "@/components/ui/StatusBadge";

interface PaymentBlock {
  id: string;
  paidAt: string;
  paidTrainings: number;
  used: number;
  pricePerBlock?: number;
  active: boolean;
}

export default function ClientBlock({
  onBack,
  onToProfile,
}: {
  onBack: () => void;
  onToProfile: () => void;
}) {
  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  useEffect(() => {
    const loadBlock = async () => {
      if (!token) {
        setBlock(null);
        setErrorMessage("Токен отсутствует. Повторите вход.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/payment-blocks/user/me/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          setBlock(data);
        } else {
          setBlock(null);
          setErrorMessage("У вас нет активного блока тренировок.");
        }
      } catch (error: any) {
        setBlock(null);
        setErrorMessage(error.message || "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    loadBlock();
  }, []);

  return (
    <Center
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        padding: "2rem 1rem",
      }}
    >
      <Card
        withBorder
        radius="xl"
        p="xl"
        shadow="xs"
        style={{ width: "100%", maxWidth: 420 }}
      >
        <Stack spacing="lg">
          <Title order={3} c="#1a1a1a">
            📦 Абонемент
          </Title>

          {loading ? (
            <Center>
              <Loader size="sm" />
            </Center>
          ) : !block ? (
            <Text size="sm" c="red" align="center">
              ❌ {errorMessage || "Нет активного абонемента"}
            </Text>
          ) : (
            <Stack
              spacing="sm"
              p="md"
              style={{
                backgroundColor: "#f9f9f9",
                borderRadius: 12,
                border: "1px solid #eaeaea",
              }}
            >
              <Group position="apart">
                <Text size="sm" c="dimmed">
                  Дата оплаты
                </Text>
                <Text size="sm">
                  {dayjs(block.paidAt).format("DD.MM.YYYY")}
                </Text>
              </Group>

              <Text size="sm">Всего тренировок: <b>{block.paidTrainings}</b></Text>
              <Text size="sm">Использовано: <b>{block.used}</b></Text>
              <Text size="sm">Осталось: <b>{block.paidTrainings - block.used}</b></Text>

              {block.pricePerBlock !== undefined && (
                <Text size="sm">
                  Сумма абонемента: <b>{block.pricePerBlock} ₽</b>
                </Text>
              )}

              <Divider />

              <StatusBadge status={block.active ? "active" : "inactive"}>
                {block.active ? "Активен" : "Завершён"}
              </StatusBadge>
            </Stack>
          )}

          <ActionButton
            fullWidth
            variant="outline"
            colorStyle="black"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            Назад
          </ActionButton>

          <ActionButton
            fullWidth
            variant="outline"
            colorStyle="black"
            leftIcon={<IconHome size={16} />}
            onClick={onToProfile}
          >
            На главную
          </ActionButton>
        </Stack>
      </Card>
    </Center>
  );
}
