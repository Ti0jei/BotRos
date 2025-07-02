import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import FormSection from '@/components/ui/FormSection';
import ActionButton from '@/components/ui/ActionButton';

interface Props {
  onBack: () => void;
}

export default function ResetPassword({ onBack }: Props) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  const notify = (title: string, message: string) => {
    alert(`${title}: ${message}`);
  };

  const handleSubmit = async () => {
    if (!token || !password) {
      notify('Ошибка', 'Токен и пароль обязательны');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setDone(true);
        notify('Готово', 'Пароль успешно обновлён');
      } else {
        notify('Ошибка', data.error || 'Не удалось сбросить пароль');
      }
    } catch {
      notify('Ошибка сети', 'Проверьте подключение');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-light p-4">
      <div className="bg-white rounded-3xl shadow-md w-full max-w-sm p-6">
        <FormSection
          title="Новый пароль"
          description={!done ? 'Введите новый пароль и сохраните' : undefined}
        >
          {done ? (
            <div className="text-center space-y-4 text-sm text-gray-600">
              <p>Пароль успешно обновлён. Теперь войдите с новым паролем.</p>
              <ActionButton fullWidth variant="outline" onClick={onBack}>
                Назад ко входу
              </ActionButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink"
                  placeholder="Введите новый пароль"
                />
              </div>
              <ActionButton
                onClick={handleSubmit}
                fullWidth
                disabled={loading || !password}
              >
                {loading ? 'Сохранение...' : 'Сохранить пароль'}
              </ActionButton>
              <div className="text-center">
                <ActionButton fullWidth variant="outline" onClick={onBack}>
                  Назад ко входу
                </ActionButton>
              </div>
            </div>
          )}
        </FormSection>
      </div>
    </div>
  );
}
