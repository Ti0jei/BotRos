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
    <div style={{ background: '#f5d4ca', minHeight: '100vh', padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>
        Мои тренировки
      </h2>

      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <button onClick={onOpenBlock}>📦 Открыть блок тренировок</button>
      </div>

      {trainings.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#555' }}>Нет тренировок</p>
      ) : (
        trainings.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#ffe8e2',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <p style={{ fontWeight: 600 }}>
              {new Date(t.date).toLocaleDateString()} в {t.hour}:00
            </p>
            <p>Статус: {t.status}</p>

            {t.status === 'PENDING' || editingId === t.id ? (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => updateStatus(t.id, 'CONFIRMED')} style={{ marginRight: 8 }}>
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

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button onClick={onBack}>← Назад</button>
      </div>
    </div>
  );
}
