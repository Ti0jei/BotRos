import { useState, useEffect } from "react";
import {
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  Card,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Stack,
  Group,
  Center,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import ActionButton from "@/components/ui/ActionButton";

interface Props {
  onLoggedIn: (profile: any) => void;
  onResetRequest: () => void;
  onRegisterRequest?: () => void; // ✅ поддержка нижней кнопки регистрации
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
    <div className="min-h-screen bg-pink-light flex flex-col items-center justify-center px-4 pb-6">
      <Card shadow="md" radius="xl" p="lg" withBorder className="w-full max-w-md bg-white">
        <Stack spacing="lg">
          <div>
            <Title order={2} className="text-center text-pink mb-1">
              Вход в аккаунт
            </Title>
            <Text size="sm" color="dimmed" className="text-center">
              Введите email и пароль для авторизации
            </Text>
          </div>

          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            radius="xl"
            size="md"
            placeholder="you@email.com"
          />

          <PasswordInput
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            radius="xl"
            size="md"
            placeholder="••••••••"
          />

          <ActionButton onClick={handleLogin} disabled={loading} fullWidth>
            {loading ? "Вход..." : "Войти"}
          </ActionButton>

          {showResend && (
            <ActionButton
              onClick={handleResend}
              variant="outline"
              disabled={resending}
              fullWidth
            >
              {resending ? "Отправка..." : "Отправить письмо повторно"}
            </ActionButton>
          )}

          <Group position="right">
            <button
              onClick={onResetRequest}
              className="text-sm text-pink hover:underline transition"
            >
              Забыли пароль?
            </button>
          </Group>
        </Stack>
      </Card>

      {onRegisterRequest && (
        <Center className="mt-6 w-full max-w-md">
          <ActionButton
            variant="light"
            onClick={onRegisterRequest}
            fullWidth
          >
            Зарегистрироваться
          </ActionButton>
        </Center>
      )}
    </div>
  );
}
