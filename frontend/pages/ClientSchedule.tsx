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
    <div>
      <h2>Мои тренировки</h2>

      <button onClick={onOpenBlock}>Открыть блок тренировок</button>

      {trainings.length === 0 ? (
        <p>Нет тренировок</p>
      ) : (
        trainings.map((t) => (
          <div key={t.id}>
            <div>
              {t.date} в {t.hour}:00 — {t.status}
            </div>

            {t.status === 'PENDING' || editingId === t.id ? (
              <div>
                <button onClick={() => updateStatus(t.id, 'CONFIRMED')}>Приду</button>
                <button onClick={() => updateStatus(t.id, 'DECLINED')}>Не приду</button>
              </div>
            ) : (
              <div>
                <p>
                  {t.status === 'CONFIRMED'
                    ? 'Вы подтвердили участие'
                    : 'Вы отказались'}
                </p>
                <button onClick={() => setEditingId(t.id)}>Изменить</button>
              </div>
            )}
          </div>
        ))
      )}

      <button onClick={onBack}>Назад</button>
    </div>
  );
}
