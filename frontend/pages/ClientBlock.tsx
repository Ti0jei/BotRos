import { useEffect, useState } from 'react';
import { getToken } from '../utils/auth';

interface PaymentBlock {
  id: string;
  paidAt: string;
  paidTrainings: number;
  used: number;
  pricePerTraining: number;
  active: boolean;
}

export default function ClientBlock({ onBack }: { onBack: () => void }) {
  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  useEffect(() => {
    const loadBlock = async () => {
      try {
        const res = await fetch(`${API}/api/payment-blocks/user/me/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBlock(data);
        } else {
          setBlock(null);
        }
      } catch (err) {
        console.error('Ошибка при загрузке блока:', err);
        setBlock(null);
      } finally {
        setLoading(false);
      }
    };
    loadBlock();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>📦 Блок тренировок</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : !block ? (
        <p style={{ color: 'red' }}>У вас нет активного блока.</p>
      ) : (
        <div>
          <p>Дата оплаты: {new Date(block.paidAt).toLocaleDateString()}</p>
          <p>Всего тренировок: {block.paidTrainings}</p>
          <p>Использовано: {block.used}</p>
          <p>Осталось: {block.paidTrainings - block.used}</p>
          <p>Цена за тренировку: {block.pricePerTraining} ₽</p>
          <p>Статус: {block.active ? 'Активен' : 'Завершён'}</p>
        </div>
      )}

      <button onClick={onBack} style={{ marginTop: 20 }}>
        ← Назад к тренировкам
      </button>
    </div>
  );
}
