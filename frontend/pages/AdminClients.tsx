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
} from '@mantine/core';

interface Client {
  id: string;
  name: string;
  age: number;
}

export default function AdminClients({ onBack }: { onBack: () => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;

  const loadClients = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setClients(data);
    setLoading(false);
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
    // В будущем — открыть отдельную страницу с его питанием/замерами/прогрессом
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <Container>
      <Title order={2} mb="md">Клиенты</Title>

      {loading ? (
        <Loader />
      ) : (
        <Stack>
          {clients.map((client) => (
            <Card key={client.id} withBorder shadow="xs" radius="md" p="md">
              <Group position="apart" mb="xs">
                <Text fw={500}>{client.name}</Text>
                <Text size="sm" color="dimmed">{client.age} лет</Text>
              </Group>
              <Group grow>
                <Button variant="light" color="blue" onClick={() => viewClient(client)}>
                  Посмотреть
                </Button>
                <Button variant="light" color="gray" disabled>
                  💬 Комментарий
                </Button>
                <Button variant="light" color="red" onClick={() => deleteClient(client.id)}>
                  Удалить
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Button fullWidth mt="lg" variant="subtle" onClick={onBack}>
        ← Назад
      </Button>
    </Container>
  );
}
