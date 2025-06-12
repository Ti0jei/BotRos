import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Button,
  Stack,
  Group,
  Loader,
  Badge,
} from '@mantine/core';
import ClientPayments from './ClientPayments'; // ← импорт страницы оплат

interface Client {
  id: string;
  name: string;
  age: number;
}

interface Stats {
  total: number;
  confirmed: number;
  attended: number;
  missed: number;
}

export default function AdminClients({ onBack }: { onBack: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, Stats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null); // ← новый state
  const API = import.meta.env.VITE_API_BASE_URL;

  const loadClients = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setClients(data);
    setLoading(false);

    for (const client of data) {
      loadStats(client.id);
    }
  };

  const loadStats = async (userId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/trainings/user/${userId}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStatsMap((prev) => ({ ...prev, [userId]: data }));
  };

  const deleteClient = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/clients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadClients();
  };

  const viewClient = (client: Client) => {
    alert(`Раздел "Питание клиента ${client.name}" в разработке`);
  };

  const openPayments = (client: Client) => {
    setSelectedClient(client); // ← переключаемся на страницу оплаты
  };

  useEffect(() => {
    loadClients();
  }, []);

  if (selectedClient) {
    return (
      <ClientPayments
        client={selectedClient}
        onBack={() => setSelectedClient(null)} // ← вернуться назад к списку клиентов
      />
    );
  }

  return (
    <Container>
      <Title order={2} mb="md">Клиенты</Title>

      {loading ? (
        <Loader />
      ) : (
        <Stack>
          {clients.map((client) => {
            const stats = statsMap[client.id];
            return (
              <Card key={client.id} withBorder shadow="xs" radius="md" p="md">
                <Group position="apart" mb="xs">
                  <Text fw={500}>{client.name}</Text>
                  <Text size="sm" color="dimmed">{client.age} лет</Text>
                </Group>

                {stats ? (
                  <Group spacing="xs" mb="xs">
                    <Badge color="gray">Назначено: {stats.total}</Badge>
                    <Badge color="blue">Подтвердил: {stats.confirmed}</Badge>
                    <Badge color="green">Был: {stats.attended}</Badge>
                    <Badge color="red">Пропустил: {stats.missed}</Badge>
                  </Group>
                ) : (
                  <Text size="sm" color="dimmed">Загрузка статистики...</Text>
                )}

                <Group grow>
                  <Button variant="light" color="blue" onClick={() => viewClient(client)}>
                    Посмотреть
                  </Button>
                  <Button variant="light" color="teal" onClick={() => openPayments(client)}>
                    💸 Оплаты
                  </Button>
                  <Button variant="light" color="gray" disabled>
                    💬 Комм
                  </Button>
                  <Button variant="light" color="red" onClick={() => deleteClient(client.id)}>
                    Удалить
                  </Button>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}

      <Button fullWidth mt="lg" variant="subtle" onClick={onBack}>
        ← Назад
      </Button>
    </Container>
  );
}
