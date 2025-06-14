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
import { Container, Button, Center, Loader, Text } from '@mantine/core';
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
          console.warn('❌ Сервер не вернул профиль, токен удалён');
          localStorage.removeItem('token');
          setProfile(null);
          setView('login');
        }
      })
      .catch((err) => {
        console.error('Ошибка при загрузке профиля:', err);
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

  // Показываем loader при загрузке профиля
  if (profileLoading && localStorage.getItem('token')) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // Защита от "белого экрана"
  if (!profile && view === 'profile') {
    console.warn('❌ Профиль пустой, возврат на login');
    setView('login');
    return null;
  }

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
