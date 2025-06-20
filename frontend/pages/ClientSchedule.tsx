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
    <div style={{ background: '#f5d4ca', minHeight: '100vh', padding: 24 }}>
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          maxWidth: 400,
          margin: '0 auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Мои тренировки</h2>

        <button
          onClick={onOpenBlock}
          style={{ width: '100%', marginBottom: 20 }}
        >
          📦 Открыть блок тренировок
        </button>

        {trainings.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>
            Нет тренировок
          </p>
        ) : (
          trainings.map((t) => (
            <div
              key={t.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <p>
                <b>{t.date}</b> в {t.hour}:00
              </p>
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
                  <p style={{ marginBottom: 8 }}>
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

        <button
          onClick={onBack}
          style={{ width: '100%', marginTop: 20 }}
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}
