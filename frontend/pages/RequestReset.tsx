import { useState } from "react";
import {
  TextInput,
  Text,
  Title,
  Stack,
  Card,
  Center,
} from "@mantine/core";
import { IconMail } from "@tabler/icons-react";
import ActionButton from "@/components/ui/ActionButton";

interface Props {
  onBack: () => void;
}

export default function RequestReset({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  const notify = (title: string, message: string) => {
    alert(`${title}: ${message}`);
  };

  const handleSubmit = async () => {
    if (!email) {
      notify("Email не указан", "Введите email для сброса пароля");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        notify("Письмо отправлено", "Если email существует, инструкция отправлена");
      } else {
        const err = await res.json();
        notify("Ошибка", err.error || "Не удалось отправить письмо");
      }
    } catch {
      notify("Ошибка сети", "Проверьте подключение к интернету");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f7f7",
        padding: "2rem 1rem",
      }}
    >
      <Card
        shadow="xs"
        radius="xl"
        p="xl"
        withBorder
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#ffffff",
          borderColor: "#eaeaea",
        }}
      >
        <Stack spacing="lg">
          <Stack spacing={4} align="center">
            <Title order={2} c="#1a1a1a">
              Сброс пароля
            </Title>
            {!sent && (
              <Text size="sm" c="dimmed">
                Введите email, чтобы получить ссылку на сброс
              </Text>
            )}
          </Stack>

          {sent ? (
            <Text size="sm" align="center" c="dimmed">
              Если такой email существует, инструкция по сбросу отправлена.
              Проверьте свою почту.
            </Text>
          ) : (
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="Введите ваш email"
              radius="xl"
              required
            />
          )}

          {/* Кнопка отправки / назад */}
          <ActionButton
            onClick={sent ? onBack : handleSubmit}
            disabled={!sent && (!email || loading)}
            fullWidth
            variant="filled"
            colorStyle="black"
            leftIcon={!sent ? <IconMail size={16} /> : undefined}
          >
            {sent ? "Готово" : loading ? "Отправка..." : "Сбросить пароль"}
          </ActionButton>

          {/* Всегда доступная кнопка "Назад" */}
          <ActionButton
            onClick={onBack}
            fullWidth
            variant="outline"
            colorStyle="black"
          >
            Назад
          </ActionButton>
        </Stack>
      </Card>
    </Center>
  );
}
