import { useState } from "react";
import {
  TextInput,
  Text,
  Title,
  Stack,
  Card,
  Group,
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
    <div className="min-h-screen bg-pink-light flex items-center justify-center px-4">
      <Card shadow="md" radius="xl" p="lg" withBorder className="w-full max-w-md bg-white">
        <Stack spacing="lg">
          <div>
            <Title order={2} className="text-center text-pink mb-1">Сброс пароля</Title>
            {!sent && (
              <Text size="sm" color="dimmed" className="text-center">
                Введите email, чтобы получить ссылку на сброс
              </Text>
            )}
          </div>

          {sent ? (
            <Stack spacing="md">
              <Text className="text-center text-gray-600 text-sm">
                Если такой email существует, инструкция по сбросу отправлена.
                Проверьте свою почту.
              </Text>
              <ActionButton fullWidth variant="outline" onClick={onBack}>
                Назад ко входу
              </ActionButton>
            </Stack>
          ) : (
            <Stack spacing="md">
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="Введите ваш email"
                radius="xl"
                required
              />

              <ActionButton
                onClick={handleSubmit}
                disabled={!email || loading}
                fullWidth
                leftIcon={<IconMail size={16} />}
              >
                {loading ? "Отправка..." : "Сбросить пароль"}
              </ActionButton>

              <Center>
                <ActionButton variant="outline" onClick={onBack}>
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
