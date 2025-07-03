import { useState, useEffect } from "react";
import { TextInput, PasswordInput, NumberInput, Text, Title, Stack, Card } from "@mantine/core";
import ActionButton from "@/components/ui/ActionButton";

export default function Register({ onRegistered }: { onRegistered: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [inviteCode, setInviteCode] = useState("");
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const tgId = window?.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (tgId) setTelegramId(tgId.toString());
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!inviteCode.trim()) {
      setError("Введите код приглашения");
      return;
    }

    if (!age || age <= 0) {
      setError("Укажите корректный возраст");
      return;
    }

    const body = {
      email,
      password,
      name,
      lastName,
      age,
      telegramId,
      inviteCode,
    };

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("lastEmail", email);
        sessionStorage.setItem("lastPassword", password);
        setSuccess(true);
        alert(data.message || "Проверьте почту для подтверждения");
      } else {
        setError(data?.error || "Ошибка при регистрации");
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    sessionStorage.setItem("lastEmail", email);
    sessionStorage.setItem("lastPassword", password);
    onRegistered();
  };

  return (
    <div className="min-h-screen bg-pink-light flex items-center justify-center p-4">
      <Card shadow="md" radius="xl" p="lg" withBorder className="w-full max-w-md bg-white">
        <Stack spacing="lg">
          <div>
            <Title order={2} className="text-center text-pink mb-1">Регистрация</Title>
            <Text size="sm" color="dimmed" className="text-center">
              Заполните все поля, чтобы создать аккаунт
            </Text>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            disabled={success}
            required
            radius="xl"
          />

          <PasswordInput
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            disabled={success}
            required
            radius="xl"
          />

          <TextInput
            label="Имя"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            disabled={success}
            required
            radius="xl"
          />

          <TextInput
            label="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
            disabled={success}
            required
            radius="xl"
          />

          <NumberInput
            label="Возраст"
            value={age}
            onChange={setAge}
            disabled={success}
            required
            min={1}
            max={120}
            radius="xl"
          />

          <TextInput
            label="Инвайт-код"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.currentTarget.value)}
            disabled={success}
            required
            radius="xl"
          />

          {!success ? (
            <ActionButton onClick={handleSubmit} disabled={loading}>
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </ActionButton>
          ) : (
            <ActionButton onClick={handleGoToLogin}>Перейти ко входу</ActionButton>
          )}
        </Stack>
      </Card>
    </div>
  );
}
