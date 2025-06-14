import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CoachProfile from './pages/CoachProfile';
import AdminSchedule from './pages/AdminSchedule';
import AdminClients from './pages/AdminClients';
import ClientSchedule from './pages/ClientSchedule';
import PaymentHistory from './pages/PaymentHistory';
import { Container, Button, Center, Loader } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

function App() {
  const [view, setView] = useState<
    'login' | 'register' | 'profile' | 'schedule' | 'clients' | 'client-calendar' | 'history'
  >('login');
  const [profile, setProfile] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tid = new URLSearchParams(window.location.search).get('tid');
    if (tid) {
      console.log('[TG] Сохраняем telegramId из URL:', tid);
      localStorage.setItem('telegramId', tid);
    }
  }, []);

  useEffect(() => {
    if (params.get('verified') === 'true') {
      showNotification({
        title: 'Почта подтверждена',
        message: 'Теперь вы можете войти',
        color: 'green',
      });

      navigate(window.location.pathname, { replace: true });
    }
  }, [params, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setProfileLoading(true);

    fetch(`${API}/api/profile`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setProfile(data);

          const telegramId = localStorage.getItem('telegramId');
          const parsedTg = telegramId ? parseInt(telegramId, 10) : null;

          if (parsedTg && !isNaN(parsedTg)) {
            console.log('[TG] Привязываем Telegram ID:', parsedTg);
            fetch(`${API}/api/auth/telegram-connect`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ telegramId: parsedTg }),
            })
              .then(() => {
                console.log('[TG] ✅ Telegram ID привязан');
                localStorage.removeItem('telegramId');
              })
              .catch((err) =>
                console.error('[TG] ❌ Ошибка при привязке telegramId:', err)
              );
          }

          setView('profile');
        } else {
          localStorage.removeItem('token');
          setView('login');
        }
      })
      .catch((err) => {
        console.error('Ошибка при загрузке профиля:', err);
        localStorage.removeItem('token');
        setView('login');
      })
      .finally(() => setProfileLoading(false));
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
          <Center>
            <Button variant="subtle" mt="sm" onClick={() => setView('register')}>
              Зарегистрироваться
            </Button>
          </Center>
        </>
      )}

      {view === 'register' && (
        <>
          <Register
            onRegistered={() => {
              setView('login');
              setTimeout(() => {
                showNotification({
                  title: 'Регистрация завершена',
                  message: 'Теперь подтвердите почту и войдите',
                  color: 'green',
                });
              }, 150);
            }}
          />
          <Center>
            <Button variant="subtle" mt="sm" onClick={() => setView('login')}>
              Назад ко входу
            </Button>
          </Center>
        </>
      )}

      {view === 'profile' && (
        <>
          {profileLoading || !profile ? (
            <Center mt="lg"><Loader size="lg" color="blue" /></Center>
          ) : profile.role === 'ADMIN' ? (
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
        <AdminSchedule onBack={() => setView('profile')} />
      )}

      {view === 'clients' && profile?.role === 'ADMIN' && (
        <AdminClients
          onBack={() => setView('profile')}
          onOpenHistory={(userId) => {
            setSelectedClientId(userId);
            setView('history');
          }}
        />
      )}

      {view === 'history' && selectedClientId && (
        <PaymentHistory userId={selectedClientId} onBack={() => setView('clients')} />
      )}
    </Container>
  );
}

export default App;
