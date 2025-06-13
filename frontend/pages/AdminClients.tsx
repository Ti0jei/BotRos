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
  TextInput,
} from '@mantine/core';
import { IconAlertTriangle, IconCurrencyDollar } from '@tabler/icons-react';
import ClientPayments from './ClientPayments';

interface Client {
  id: string;
  name: string;
  lastName?: string | null;
  internalTag?: string | null;
  age: number;
}

interface PaymentBlock {
  id: string;
  paidTrainings: number;
  pricePerTraining: number;
  used: number;
}

export default function AdminClients({
  onBack,
  onOpenHistory,
}: {
  onBack: () => void;
  onOpenHistory: (userId: string) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [blockMap, setBlockMap] = useState<Record<string, PaymentBlock | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [internalTagValue, setInternalTagValue] = useState<string>('');
  const API = import.meta.env.VITE_API_BASE_URL;

  const loadClients = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
        setError('Ошибка доступа или авторизации');
        setClients([]);
        setLoading(false);
        return;
      }
      setClients(data);
      setLoading(false);
      for (const client of data) {
        loadBlock(client.id);
      }
    } catch (err) {
      console.error('Ошибка запроса:', err);
      setError('Сервер недоступен');
      setLoading(false);
    }
  };

  const loadBlock = async (userId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/payment-blocks/user/${userId}/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : null;
      setBlockMap((prev) => ({ ...prev, [userId]: data }));
    } catch (err) {
      console.error(`Ошибка загрузки блока оплаты для ${userId}:`, err);
    }
  };

  const deleteClient = async (id: string) => {
    if (!window.confirm('Вы точно хотите удалить клиента?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/api/clients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadClients();
  };

  const startEditing = (client: Client) => {
    setEditingId(client.id);
    setInternalTagValue(client.internalTag ?? '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setInternalTagValue('');
  };

  const saveInternalTag = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/clients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ internalTag: internalTagValue }),
      });
      if (res.ok) {
        loadClients();
        cancelEditing();
      } else {
        alert('Ошибка при сохранении');
      }
    } catch (err) {
      console.error('Ошибка при PATCH /clients/:id', err);
    }
  };

  const viewClient = (client: Client) => {
    alert(`Раздел "Питание клиента ${client.name}" в разработке`);
  };

  const openPayments = (client: Client) => setSelectedClient(client);

  useEffect(() => {
    loadClients();
  }, []);

  if (selectedClient) {
    return <ClientPayments client={selectedClient} onBack={() => setSelectedClient(null)} />;
  }

  return (
    <Container>
      <Title order={2} mb="md">Клиенты</Title>

      {loading ? (
        <Loader />
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : (
        <Stack>
          {clients.map((client) => {
            const block = blockMap[client.id];
            const remaining = block ? block.paidTrainings - block.used : 0;
            const isEditing = editingId === client.id;

            return (
              <Card key={client.id} withBorder radius="md" p="md">
                <Group position="apart" mb="xs">
                  <Group spacing="xs">
                    {isEditing ? (
                      <>
                        <Text>{client.name} {client.lastName ?? ''}</Text>
                        <TextInput
                          value={internalTagValue}
                          onChange={(e) => setInternalTagValue(e.currentTarget.value)}
                          placeholder="Доп. имя"
                          size="xs"
                          style={{ width: 120 }}
                        />
                      </>
                    ) : (
                      <Text fw={500}>
                        {client.name} {client.lastName ?? ''} {client.internalTag ? `(${client.internalTag})` : ''}
                      </Text>
                    )}
                  </Group>
                  <Text size="sm" color="dimmed">{client.age} лет</Text>
                </Group>

                {!isEditing && block && (
                  <>
                    <Group spacing="xs" mb="xs">
                      <Badge color={remaining === 0 ? 'red' : 'green'}>
                        Осталось: {remaining}
                      </Badge>
                      <Badge color="teal">
                        Цена: {block.pricePerTraining} ₽
                      </Badge>
                    </Group>
                    {remaining === 0 && (
                      <Text color="red" fw={600}>
                        <IconAlertTriangle size={16} style={{ marginRight: 6 }} />
                        Требуется новый блок
                      </Text>
                    )}
                  </>
                )}

                <Stack mt="xs" spacing="xs">
                  <Group grow>
                    {isEditing ? (
                      <>
                        <Button color="green" onClick={() => saveInternalTag(client.id)}>
                          Сохранить
                        </Button>
                        <Button color="gray" onClick={cancelEditing}>
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button color="blue" onClick={() => viewClient(client)}>
                          Питание
                        </Button>
                        <Button color="teal" onClick={() => openPayments(client)}>
                          💸 Оплата
                        </Button>
                      </>
                    )}
                  </Group>
                  {!isEditing && (
                    <Stack spacing={8}>
                      <Group grow>
                        <Button
                          color="yellow"
                          variant="outline"
                          size="sm"
                          style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => onOpenHistory(client.id)}
                        >
                          📊 История оплат <IconCurrencyDollar size={18} />
                        </Button>
                      </Group>
                      <Group grow>
                        <Button color="orange" onClick={() => startEditing(client)}>
                          Псевдоним
                        </Button>
                        <Button color="red" onClick={() => deleteClient(client.id)}>
                          Удалить
                        </Button>
                      </Group>
                    </Stack>
                  )}
                </Stack>
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
