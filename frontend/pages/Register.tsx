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

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (window?.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      setTelegramId(window.Telegram.WebApp.initDataUnsafe.user.id.toString());
    }
  }, []);

  const notify = (title: string, message: string, color: 'green' | 'red') => {
    alert(`${title}: ${message}`); // можно заменить на кастомный toast
  };

  const handleSubmit = async () => {
    setError(null);

    if (!inviteCode.trim()) {
      setError('Введите код приглашения');
      return;
    }

    const parsedAge = parseInt(age.trim(), 10);
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
        notify('Проверьте почту', data.message || 'На email отправлено письмо для подтверждения.', 'green');
      } else {
        setError(data?.error || 'Ошибка при регистрации');
      }
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError('Ошибка соединения с сервером');
    }
  };

  const handleGoToLogin = () => {
    sessionStorage.setItem('lastEmail', email);
    sessionStorage.setItem('lastPassword', password);
    onRegistered();
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <FormSection
        title="Регистрация"
        description="Заполните все поля, чтобы зарегистрироваться"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <InputField
            label="Email"
            value={email}
            onChange={setEmail}
            disabled={success}
            type="email"
          />
          <InputField
            label="Пароль"
            value={password}
            onChange={setPassword}
            disabled={success}
            type="password"
          />
          <InputField
            label="Имя"
            value={name}
            onChange={setName}
            disabled={success}
          />
          <InputField
            label="Фамилия"
            value={lastName}
            onChange={setLastName}
            disabled={success}
          />
          <InputField
            label="Возраст"
            value={age}
            onChange={setAge}
            disabled={success}
          />
          <InputField
            label="Инвайт-код"
            value={inviteCode}
            onChange={setInviteCode}
            disabled={success}
          />

          {!success ? (
            <ActionButton onClick={handleSubmit}>Зарегистрироваться</ActionButton>
          ) : (
            <ActionButton onClick={handleGoToLogin}>Перейти ко входу</ActionButton>
          )}
        </div>
      </FormSection>
    </div>
  );
}

// ✅ Переиспользуемый Tailwind-инпут
function InputField({
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f06595] disabled:bg-gray-100"
        placeholder={label}
      />
    </div>
  );
}
