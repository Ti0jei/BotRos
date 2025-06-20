import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

interface Training {
  id: string;
  date: string;
  hour: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
}

export default function ClientSchedule({
  onBack,
  onOpenBlock,
}: {
  onBack: () => void;
  onOpenBlock: () => void;
}) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  const fetchTrainings = async () => {
    const res = await fetch(`${API}/api/trainings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setTrainings(data);
  };

  const updateStatus = async (id: string, status: 'CONFIRMED' | 'DECLINED') => {
    await fetch(`${API}/api/trainings/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    setEditingId(null);
    fetchTrainings();
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#f5d4ca',
        minHeight: '100vh',
        width: '100vw',
        padding: '20px 16px',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
        Мои тренировки
      </h2>

      <button onClick={onOpenBlock} style={{ padding: 10, marginBottom: 20 }}>
        📦 Открыть блок тренировок
      </button>

      {trainings.length === 0 ? (
        <p>Нет тренировок</p>
      ) : (
        trainings.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#ffcfc0',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <strong>
              {new Date(t.date).toLocaleDateString('ru-RU')} в {t.hour}:00
            </strong>
            <p>Статус: {t.status}</p>

            {t.status === 'PENDING' || editingId === t.id ? (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => updateStatus(t.id, 'CONFIRMED')}
                  style={{ marginRight: 8 }}
                >
                  ✅ Приду
                </button>
                <button onClick={() => updateStatus(t.id, 'DECLINED')}>
                  ❌ Не приду
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                <p>
                  {t.status === 'CONFIRMED'
                    ? '✅ Вы подтвердили участие'
                    : '🚫 Вы отказались'}
                </p>
                <button onClick={() => setEditingId(t.id)}>Изменить</button>
              </div>
            )}
          </div>
        ))
      )}

      <div style={{ marginTop: 40 }}>
        <button onClick={onBack}>← Назад</button>
      </div>
    </div>
  );
}
