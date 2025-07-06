import { useState, useEffect } from "react";
import {
  TextInput,
  PasswordInput,
  NumberInput,
  Text,
  Title,
  Stack,
  Card,
  Center,
} from "@mantine/core";
import ActionButton from "@/components/ui/ActionButton";

interface Props {
  onRegistered: () => void;
  onBackToLogin: () => void;
}

export default function Register({ onRegistered, onBackToLogin }: Props) {
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
    const urlTid = new URLSearchParams(window.location.search).get("tid");

    if (tgId) {
      setTelegramId(tgId.toString());
    } else if (urlTid) {
      setTelegramId(urlTid);
    }
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
          maxWidth: 460,
          backgroundColor: "#ffffff",
          borderColor: "#eaeaea",
        }}
      >
        <Stack spacing="lg">
          <Stack spacing={4} align="center">
            <Title order={2} c="#1a1a1a">
              Регистрация
            </Title>
            <Text size="sm" c="dimmed">
              Заполните все поля, чтобы создать аккаунт
            </Text>
          </Stack>

          {error && (
            <Text
              size="sm"
              style={{
                backgroundColor: "#ffe5e5",
                color: "#a11a1a",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #f5c2c7",
              }}
            >
              {error}
            </Text>
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
            <ActionButton
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
              variant="filled"
              colorStyle="black"
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </ActionButton>
          ) : (
            <ActionButton
              onClick={handleGoToLogin}
              fullWidth
              variant="filled"
              colorStyle="black"
            >
              Готово
            </ActionButton>
          )}

          <ActionButton
            onClick={onBackToLogin}
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
