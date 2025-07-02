import { useState, useEffect } from 'react';
import ActionButton from '@/components/ui/ActionButton';
import FormSection from '@/components/ui/FormSection';

export default function Register({ onRegistered }: { onRegistered: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const tgId = window?.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (tgId) setTelegramId(tgId.toString());
  }, []);

  const notify = (title: string, message: string) => {
    alert(`${title}: ${message}`);
  };

  const handleSubmit = async () => {
    setError(null);

    const parsedAge = parseInt(age.trim(), 10);
    if (!inviteCode.trim()) {
      setError('Введите код приглашения');
      return;
    }

    if (isNaN(parsedAge) || parsedAge <= 0) {
      setError('Укажите корректный возраст');
      return;
    }

    const body = {
      email,
      password,
      name,
      lastName,
      age: parsedAge,
      telegramId,
      inviteCode,
    };

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('lastEmail', email);
        sessionStorage.setItem('lastPassword', password);
        setSuccess(true);
        notify('Проверьте почту', data.message || 'Письмо отправлено');
      } else {
        setError(data?.error || 'Ошибка при регистрации');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    sessionStorage.setItem('lastEmail', email);
    sessionStorage.setItem('lastPassword', password);
    onRegistered();
  };

  return (
    <div className="min-h-screen bg-pink-light flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-md w-full max-w-sm p-6">
        <FormSection
          title="Регистрация"
          description="Заполните все поля, чтобы создать аккаунт"
        >
          <div className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <Input label="Email" value={email} onChange={setEmail} disabled={success} type="email" />
            <Input label="Пароль" value={password} onChange={setPassword} disabled={success} type="password" />
            <Input label="Имя" value={name} onChange={setName} disabled={success} />
            <Input label="Фамилия" value={lastName} onChange={setLastName} disabled={success} />
            <Input label="Возраст" value={age} onChange={setAge} disabled={success} />
            <Input label="Инвайт-код" value={inviteCode} onChange={setInviteCode} disabled={success} />

            {!success ? (
              <ActionButton onClick={handleSubmit} disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </ActionButton>
            ) : (
              <ActionButton onClick={handleGoToLogin}>Перейти ко входу</ActionButton>
            )}
          </div>
        </FormSection>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={label}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink disabled:bg-gray-100"
      />
    </div>
  );
}
