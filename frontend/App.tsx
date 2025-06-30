import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CoachProfile from './pages/CoachProfile';
import AdminSchedule from './pages/AdminSchedule';
import AdminClients from './pages/AdminClients';
import ClientSchedule from './pages/ClientSchedule';
import ClientBlock from './pages/ClientBlock';
import PaymentHistory from './pages/PaymentHistory';
import RequestReset from './pages/RequestReset';
import ResetPassword from './pages/ResetPassword';
import ClientNutrition from './pages/ClientNutrition';

import { Box, Button, Center, Loader } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

function App() {
  const [view, setView] = useState<
    | 'login'
    | 'register'
    | 'profile'
    | 'schedule'
    | 'clients'
    | 'client-calendar'
    | 'client-block'
    | 'history'
    | 'reset-request'
    | 'reset-confirm'
    | 'nutrition'
  >('login');

  const [profile, setProfile] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tid = params.get('tid');
    if (tid) localStorage.setItem('telegramId', tid);
  }, [params]);

  useEffect(() => {
    if (params.get('verified') === 'true') {
      showNotification({
        title: 'Почта подтверждена',
        message: 'Теперь вы можете войти',
        color: 'green',
      });
      navigate(window.location.pathname, { replace: true });
    }

    if (params.get('token')) {
      setView('reset-confirm');
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
          setView('profile');

          const telegramId = localStorage.getItem('telegramId');
          const parsedTg = telegramId ? parseInt(telegramId, 10) : null;

          if (parsedTg && !isNaN(parsedTg)) {
            fetch(`${API}/api/auth/telegram-connect`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ telegramId: parsedTg }),
            }).finally(() => {
              localStorage.removeItem('telegramId');
            });
          }
        } else {
          localStorage.removeItem('token');
          setProfile(null);
          setView('login');
        }
      })
      .catch((err) => {
        console.error('Ошибка загрузки профиля:', err);
        localStorage.removeItem('token');
        setProfile(null);
        setView('login');
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setProfile(null);
    setView('login');
  };

  if (profileLoading && localStorage.getItem('token')) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!profile && view === 'profile' && !profileLoading) {
    console.warn('❌ Профиль пустой, возврат на login');
    setView('login');
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        background: '#e8b3a6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        width: '100vw',
      }}
    >
      {view === 'login' && (
        <>
          <Login
            onLoggedIn={() => setView('profile')}
            onResetRequest={() => setView('reset-request')}
          />
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
              }, 100);
            }}
          />
          <Center>
            <Button variant="subtle" mt="sm" onClick={() => setView('login')}>
              Назад ко входу
            </Button>
          </Center>
        </>
      )}

      {view === 'reset-request' && (
        <RequestReset onBack={() => setView('login')} />
      )}

      {view === 'reset-confirm' && (
        <ResetPassword onBack={() => setView('login')} />
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
              onOpenNutrition={() => setView('nutrition')}
            />
          )}
        </>
      )}

      {view === 'client-calendar' && profile?.role === 'USER' && (
        <ClientSchedule
          onBack={() => setView('profile')}
          onOpenBlock={() => setView('client-block')}
        />
      )}

      {view === 'client-block' && profile?.role === 'USER' && (
        <ClientBlock
          onBack={() => setView('client-calendar')}
          onToProfile={() => setView('profile')}
        />
      )}

      {view === 'nutrition' && profile?.role === 'USER' && (
        <ClientNutrition userId={profile.id} onBack={() => setView('profile')} />
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
    </Box>
  );
}

export default App;
