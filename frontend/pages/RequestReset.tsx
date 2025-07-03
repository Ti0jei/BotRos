import { useState } from "react";
import {
  TextInput,
  Text,
  Title,
  Stack,
  Card,
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
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#ffd6e0] to-[#ff8ca3] flex items-center justify-center px-4 pb-24">
        <Card shadow="md" radius="xl" p="lg" withBorder className="w-full max-w-md bg-white">
          <Stack spacing="lg">
            <div>
              <Title order={2} className="text-center mb-1" c="#d6336c">
                Сброс пароля
              </Title>
              {!sent && (
                <Text size="sm" color="dimmed" className="text-center">
                  Введите email, чтобы получить ссылку на сброс
                </Text>
              )}
            </div>

            {sent ? (
              <Text className="text-center text-gray-600 text-sm mt-2">
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
          </Stack>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 bg-white border-t border-gray-100 z-50">
        <ActionButton
          onClick={sent ? onBack : handleSubmit}
          disabled={!sent && (!email || loading)}
          fullWidth
          variant={sent ? "light" : "filled"}
          color="pink"
          leftIcon={!sent ? <IconMail size={16} /> : undefined}
        >
          {sent ? "Назад" : loading ? "Отправка..." : "Сбросить пароль"}
        </ActionButton>
      </div>
    </>
  );
}
