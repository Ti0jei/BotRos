import { useState } from 'react';
import { IconMail } from '@tabler/icons-react';
import ActionButton from '@/components/ui/ActionButton';
import FormSection from '@/components/ui/FormSection';

interface Props {
  onBack: () => void;
}

export default function RequestReset({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  const notify = (title: string, message: string) => {
    alert(`${title}: ${message}`); // можно заменить на custom toast
  };

  const handleSubmit = async () => {
    if (!email) {
      notify('Email не указан', 'Введите email для сброса пароля');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        notify('Письмо отправлено', 'Если email существует, инструкция отправлена');
      } else {
        const err = await res.json();
        notify('Ошибка', err.error || 'Не удалось отправить письмо');
      }
    } catch {
      notify('Ошибка сети', 'Проверьте подключение к интернету');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <FormSection
        title="Сброс пароля"
        description={sent ? undefined : 'Введите email, на который придёт письмо'}
      >
        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Если такой email существует, письмо с инструкцией отправлено. Проверьте почту.
            </p>
            <ActionButton variant="outline" onClick={onBack}>
              На главную
            </ActionButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f06595]"
                placeholder="Введите ваш email"
              />
            </div>
            <ActionButton
              onClick={handleSubmit}
              disabled={!email || loading}
              leftIcon={<IconMail size={16} />}
            >
              {loading ? 'Отправка...' : 'Сбросить пароль'}
            </ActionButton>
            <div className="text-center">
              <ActionButton variant="outline" onClick={onBack}>
                На главную
              </ActionButton>
            </div>
          </div>
        )}
      </FormSection>
    </div>
  );
}
