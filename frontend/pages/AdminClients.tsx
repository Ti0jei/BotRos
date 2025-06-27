// frontend/pages/AdminClients.tsx
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
  Box,
} from '@mantine/core';
import {
  IconCash,
  IconChefHat,
  IconGift,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import ClientPayments from './ClientPayments';
import ClientNutrition from './ClientNutrition';

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
  const [view, setView] = useState<'payments' | 'nutrition' | null>(null);
  const [blockMap, setBlockMap] = useState<Record<string, PaymentBlock | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [internalTagValue, setInternalTagValue] = useState<string>('');
  const API = import.meta.env.VITE_API_BASE_URL;

  const pinkButtonStyle = {
    root: {
      color: '#d6336c',
      border: '1px solid #d6336c',
      borderRadius: 8,
      fontWeight: 500,
      backgroundColor: 'transparent',
      whiteSpace: 'nowrap',
      '&:hover': { backgroundColor: '#ffe3ed' },
    },
  };

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
      for (const client of data) loadBlock(client.id);
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

  useEffect(() => {
    loadClients();
  }, []);

  if (selectedClient && view === 'payments') {
    return <ClientPayments client={selectedClient} onBack={() => {
      setSelectedClient(null);
      setView(null);
    }} />;
  }

  if (selectedClient && view === 'nutrition') {
    return <ClientNutrition userId={selectedClient.id} isAdmin={true} onBack={() => {
      setSelectedClient(null);
      setView(null);
    }} />;
  }

  return (
    <Box style={{ backgroundColor: '#f5d4ca', minHeight: '100vh', paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={2} mb="md" style={{ color: '#222' }}>Клиенты</Title>

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
                <Card key={client.id} withBorder radius="md" p="md" shadow="sm">
                  <Stack spacing="xs">
                    <Group position="apart">
                      <Text fw={600}>
                        {client.name} {client.lastName ?? ''}{' '}
                        {client.internalTag && (
                          <Text span color="dimmed">({client.internalTag})</Text>
                        )}
                      </Text>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: block ? 'green' : 'red',
                        }}
                      />
                    </Group>

                    <Text size="sm" color="dimmed">{client.age} лет</Text>

                    {isEditing ? (
                      <Group grow>
                        <TextInput
                          value={internalTagValue}
                          onChange={(e) => setInternalTagValue(e.currentTarget.value)}
                          placeholder="Доп. имя"
                        />
                        <Button color="green" onClick={() => saveInternalTag(client.id)}>Сохранить</Button>
                        <Button color="gray" onClick={cancelEditing}>Отмена</Button>
                      </Group>
                    ) : (
                      <>
                        {block && (
                          <Group spacing="xs">
                            <Badge color={remaining === 0 ? 'red' : 'green'}>
                              Осталось: {remaining}
                            </Badge>
                            <Badge color="teal">
                              Цена: {block.pricePerTraining} ₽
                            </Badge>
                          </Group>
                        )}

                        <Group grow mt="xs">
                          <Button
                            styles={pinkButtonStyle}
                            leftIcon={<IconChefHat size={16} />}
                            onClick={() => {
                              setSelectedClient(client);
                              setView('nutrition');
                            }}
                          >
                            Питание
                          </Button>

                          <Button
                            styles={pinkButtonStyle}
                            leftIcon={<IconCash size={16} />}
                            onClick={() => {
                              setSelectedClient(client);
                              setView('payments');
                            }}
                          >
                            Оплата
                          </Button>
                        </Group>

                        <Group grow mt={6}>
                          <Button
                            styles={pinkButtonStyle}
                            leftIcon={<IconGift size={16} />}
                            onClick={() => onOpenHistory(client.id)}
                          >
                            История оплат
                          </Button>
                        </Group>

                        <Group grow mt={6}>
                          <Button
                            styles={pinkButtonStyle}
                            color="orange"
                            leftIcon={<IconPencil size={16} />}
                            onClick={() => startEditing(client)}
                          >
                            Псевдоним
                          </Button>
                          <Button
                            styles={pinkButtonStyle}
                            color="red"
                            leftIcon={<IconTrash size={16} />}
                            onClick={() => deleteClient(client.id)}
                          >
                            Удалить
                          </Button>
                        </Group>
                      </>
                    )}
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}

        <Box
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'white',
            padding: '10px 0',
            textAlign: 'center',
            boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
            zIndex: 1000,
          }}
        >
          <Button
            variant="subtle"
            color="pink"
            size="sm"
            onClick={onBack}
            leftIcon={<span style={{ fontSize: 16 }}>←</span>}
          >
            Назад к профилю
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
