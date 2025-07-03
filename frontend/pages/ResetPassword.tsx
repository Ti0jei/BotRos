import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import {
  PasswordInput,
  Text,
  Title,
  Stack,
  Card,
  Center,
} from "@mantine/core";
import ActionButton from "@/components/ui/ActionButton";

interface Props {
  onBack: () => void;
}

export default function ResetPassword({ onBack }: Props) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  const notify = (title: string, message: string) => {
    alert(`${title}: ${message}`);
  };

  const handleSubmit = async () => {
    if (!token || !password) {
      notify("Ошибка", "Токен и пароль обязательны");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setDone(true);
        notify("Готово", "Пароль успешно обновлён");
      } else {
        notify("Ошибка", data.error || "Не удалось сбросить пароль");
      }
    } catch {
      notify("Ошибка сети", "Проверьте подключение");
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
          {/* Заголовок */}
          <Stack spacing={4} align="center">
            <Title order={2} c="#1a1a1a">
              Новый пароль
            </Title>
            {!done && (
              <Text size="sm" c="dimmed">
                Введите новый пароль и сохраните
              </Text>
            )}
          </Stack>

          {/* Состояние после отправки */}
          {done ? (
            <Text size="sm" align="center" c="dimmed">
              Пароль успешно обновлён. Теперь вы можете войти с новым паролем.
            </Text>
          ) : (
            <PasswordInput
              label="Новый пароль"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="Введите новый пароль"
              radius="xl"
              required
            />
          )}

          {/* Основная кнопка */}
          <ActionButton
            onClick={done ? onBack : handleSubmit}
            fullWidth
            variant="filled"
            colorStyle="black"
            disabled={!done && (loading || !password)}
          >
            {done ? "Готово" : loading ? "Сохранение..." : "Сохранить пароль"}
          </ActionButton>

          {/* Кнопка Назад (только до завершения) */}
          {!done && (
            <ActionButton
              onClick={onBack}
              fullWidth
              variant="outline"
              colorStyle="black"
            >
              Назад
            </ActionButton>
          )}
        </Stack>
      </Card>
    </Center>
  );
}
