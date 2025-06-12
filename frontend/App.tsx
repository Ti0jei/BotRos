import { useEffect, useState } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CoachProfile from './pages/CoachProfile';
import AdminSchedule from './pages/AdminSchedule';
import AdminClients from './pages/AdminClients';
import ClientSchedule from './pages/ClientSchedule';
import { Container, Button } from '@mantine/core';

function App() {
  const [view, setView] = useState<
    'login' | 'register' | 'profile' | 'schedule' | 'clients' | 'client-calendar'
  >('login');
  const [profile, setProfile] = useState<any>(null);

  const API = import.meta.env.VITE_API_BASE_URL;

  // 🟡 1. Сохраняем telegramId из URL, если есть
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('tid');
    if (tid) {
      localStorage.setItem('telegramId', tid);
    }
  }, []);

  // 🔐 2. После входа — загружаем профиль, и если есть telegramId — привязываем
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API}/api/profile`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProfile(data);
          setView('profile');

          const telegramId = localStorage.getItem('telegramId');
          if (telegramId) {
            fetch(`${API}/api/auth/telegram-connect`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ telegramId: parseInt(telegramId, 10) }),
            })
              .then(() => {
                console.log('[TG] Telegram ID привязан');
                localStorage.removeItem('telegramId');
              })
              .catch((err) => console.error('[TG] Ошибка при привязке telegramId:', err));
          }
        } else {
          localStorage.removeItem('token');
          setView('login');
        }
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setProfile(null);
    setView('login');
  };

  return (
    <Container size="xs" pt="xl">
      {view === 'login' && (
        <>
          <Login onLoggedIn={() => setView('profile')} />
          <Button variant="subtle" mt="sm" fullWidth onClick={() => setView('register')}>
            Зарегистрироваться
          </Button>
        </>
      )}

      {view === 'register' && (
        <>
          <Register onRegistered={() => setView('profile')} />
          <Button variant="subtle" mt="sm" fullWidth onClick={() => setView('login')}>
            Назад ко входу
          </Button>
        </>
      )}

      {view === 'profile' && profile && (
        <>
          {profile.role === 'ADMIN' ? (
            <CoachProfile
              profile={profile}
              onLogout={logout}
              onOpenSchedule={() => setView('schedule')}
              onOpenClients={() => setView('clients')}
            />
          ) : (
            <Profile
              profile={profile}
              onLogout={logout}
              onOpenTrainings={() => setView('client-calendar')}
            />
          )}
        </>
      )}

      {view === 'client-calendar' && profile?.role === 'USER' && (
        <ClientSchedule onBack={() => setView('profile')} />
      )}

      {view === 'schedule' && profile?.role === 'ADMIN' && (
        <>
          <AdminSchedule />
          <Button fullWidth mt="sm" variant="subtle" onClick={() => setView('profile')}>
            ← Назад к профилю
          </Button>
        </>
      )}

      {view === 'clients' && profile?.role === 'ADMIN' && (
        <AdminClients onBack={() => setView('profile')} />
      )}
    </Container>
  );
}

export default App;
