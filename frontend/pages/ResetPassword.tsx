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
    <div className="min-h-screen bg-pink-light flex items-center justify-center px-4">
      <Card shadow="md" radius="xl" p="lg" withBorder className="w-full max-w-md bg-white">
        <Stack spacing="lg">
          <div>
            <Title order={2} className="text-center text-pink mb-1">Новый пароль</Title>
            {!done && (
              <Text size="sm" color="dimmed" className="text-center">
                Введите новый пароль и сохраните
              </Text>
            )}
          </div>

          {done ? (
            <Stack spacing="md">
              <Text className="text-center text-gray-600 text-sm">
                Пароль успешно обновлён. Теперь вы можете войти.
              </Text>
              <ActionButton fullWidth variant="outline" onClick={onBack}>
                Назад ко входу
              </ActionButton>
            </Stack>
          ) : (
            <Stack spacing="md">
              <PasswordInput
                label="Новый пароль"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="Введите новый пароль"
                radius="xl"
                required
              />

              <ActionButton
                onClick={handleSubmit}
                fullWidth
                disabled={loading || !password}
              >
                {loading ? "Сохранение..." : "Сохранить пароль"}
              </ActionButton>

              <Center>
                <ActionButton fullWidth variant="outline" onClick={onBack}>
                  Назад ко входу
                </ActionButton>
              </Center>
            </Stack>
          )}
        </Stack>
      </Card>
    </div>
  );
}
