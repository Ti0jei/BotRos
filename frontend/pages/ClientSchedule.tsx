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
        padding: 32,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 24,
          maxWidth: 360,
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
          Мои тренировки
        </h2>

        <button
          onClick={onOpenBlock}
          style={{
            padding: '10px 16px',
            marginBottom: 24,
            width: '100%',
            borderRadius: 6,
            border: '1px solid black',
            background: '#eee',
            cursor: 'pointer',
          }}
        >
          📦 Открыть блок тренировок
        </button>

        {trainings.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Нет тренировок</p>
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
                  <button onClick={() => updateStatus(t.id, 'DECLINED')}>❌ Не приду</button>
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

        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '10px 0',
            fontSize: 16,
            marginTop: 12,
            border: '1px solid black',
            borderRadius: 6,
            background: 'white',
            cursor: 'pointer',
          }}
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}
