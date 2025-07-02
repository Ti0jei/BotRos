import { useState, useEffect } from 'react';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import FormSection from '@/components/ui/FormSection';
import ActionButton from '@/components/ui/ActionButton';

export default function Login({
  onLoggedIn,
  onResetRequest,
}: {
  onLoggedIn: (profile: any) => void;
  onResetRequest: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('lastEmail');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const notify = (title: string, message: string, color: 'red' | 'green') => {
    alert(`${title}: ${message}`);
    // TODO: заменить на собственный компонент уведомлений
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.reason === 'email_not_verified') {
          setShowResend(true);
        }
        notify('Ошибка входа', data.message || 'Неверные данные', 'red');
      } else {
        localStorage.setItem('token', data.token);
        sessionStorage.setItem('lastEmail', email);

        const profileRes = await fetch(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        if (profileRes.ok) {
          const profile = await profileRes.json();
          onLoggedIn(profile);
        } else {
          notify('Ошибка', 'Не удалось загрузить профиль', 'red');
        }
      }
    } catch {
      notify('Ошибка', 'Сервер недоступен', 'red');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${API}/api/auth/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        notify('Письмо отправлено', 'Проверьте почту для подтверждения', 'green');
      } else {
        notify('Ошибка', data.message || 'Не удалось отправить', 'red');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <FormSection title="Вход в Krissfit" description="Введите почту и пароль">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f06595]"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f06595]"
              placeholder="••••••••"
            />
          </div>

          <ActionButton onClick={handleLogin} disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти'}
          </ActionButton>

          {showResend && (
            <ActionButton onClick={handleResend} variant="outline" disabled={resending}>
              {resending ? 'Отправка...' : 'Отправить письмо повторно'}
            </ActionButton>
          )}

          <div className="flex justify-end">
            <button
              onClick={onResetRequest}
              className="text-sm text-[#f06595] hover:underline"
            >
              Забыли пароль?
            </button>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
