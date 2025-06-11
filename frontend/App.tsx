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

          // === Инициализация Telegram ===
          const tg = window.Telegram?.WebApp;
          if (tg) {
            tg.ready();
            setTimeout(() => {
              const telegramId = tg?.initDataUnsafe?.user?.id;
              console.log('[TG]', telegramId, 'Token:', token);

              if (telegramId) {
                fetch(`${API}/api/auth/telegram-connect`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ telegramId }),
                });
              }
            }, 300);
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
        <>
          <AdminClients onBack={() => setView('profile')} />
        </>
      )}
    </Container>
  );
}

export default App;
