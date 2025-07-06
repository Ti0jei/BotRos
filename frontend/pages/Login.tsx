import { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Stack,
  Center,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import ActionButton from "@/components/ui/ActionButton";

interface Props {
  onLoggedIn: (profile: any) => void;
  onResetRequest: () => void;
  onRegisterRequest?: () => void;
}

export default function Login({
  onLoggedIn,
  onResetRequest,
  onRegisterRequest,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("lastEmail");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const notify = (title: string, message: string, color: "red" | "green") => {
    showNotification({
      title,
      message,
      color,
      icon: color === "green" ? <IconCheck size={18} /> : <IconAlertCircle size={18} />,
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.reason === "email_not_verified") setShowResend(true);
        notify("Ошибка входа", data.message || "Неверные данные", "red");
      } else {
        localStorage.setItem("token", data.token);
        sessionStorage.setItem("lastEmail", email);

        const profileRes = await fetch(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        if (profileRes.ok) {
          const profile = await profileRes.json();
          onLoggedIn(profile);
        } else {
          notify("Ошибка", "Не удалось загрузить профиль", "red");
        }
      }
    } catch {
      notify("Ошибка", "Сервер недоступен", "red");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${API}/api/auth/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        notify("Письмо отправлено", "Проверьте почту для подтверждения", "green");
      } else {
        notify("Ошибка", data.message || "Не удалось отправить", "red");
      }
    } finally {
      setResending(false);
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
              Вход
            </Title>
            <Text size="sm" c="dimmed">
              Авторизуйтесь, чтобы продолжить
            </Text>
          </Stack>

          {/* Email */}
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            radius="xl"
            size="md"
            placeholder="you@example.com"
          />

          {/* Пароль */}
          <PasswordInput
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            radius="xl"
            size="md"
            placeholder="••••••••"
          />

          {/* Войти */}
          <ActionButton
            onClick={handleLogin}
            loading={loading}
            fullWidth
            variant="filled"
            colorStyle="black"
          >
            Войти
          </ActionButton>

          {/* Повторная отправка */}
          {showResend && (
            <ActionButton
              onClick={handleResend}
              variant="outline"
              disabled={resending}
              fullWidth
              colorStyle="black"
            >
              {resending ? "Отправка..." : "Отправить письмо повторно"}
            </ActionButton>
          )}

          {/* Забыли пароль */}
          <Text
            size="sm"
            align="center"
            style={{ color: "#1a1a1a", cursor: "pointer" }}
            onClick={onResetRequest}
          >
            Забыли пароль?
          </Text>

          {/* Зарегистрироваться */}
          {onRegisterRequest && (
            <ActionButton
              variant="outline"
              colorStyle="black"
              onClick={onRegisterRequest}
              fullWidth
            >
              Зарегистрироваться
            </ActionButton>
          )}
        </Stack>
      </Card>
    </Center>
  );
}
