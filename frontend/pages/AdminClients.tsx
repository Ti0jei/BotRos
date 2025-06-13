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
import {
  IconAlertTriangle,
  IconCurrencyDollar,
  IconEdit,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import ClientPayments from './ClientPayments';

interface Client {
  id: string;
  name: string;
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
      if (res.ok) {
        const data = await res.json();
        setBlockMap((prev) => ({ ...prev, [userId]: data }));
      } else {
        setBlockMap((prev) => ({ ...prev, [userId]: null }));
      }
    } catch (err) {
      console.error(`Ошибка загрузки блока оплаты для ${userId}:`, err);
    }
  };

  const deleteClient = async (id: string) => {
    if (!window.confirm('Вы точно хотите удалить клиента? Это действие необратимо.')) {
      return;
    }
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
      console.error('Ошибка сохранения internalTag:', err);
      alert('Ошибка при сохранении');
    }
  };

  const viewClient = (client: Client) => {
    alert(`Раздел "Питание клиента ${client.name}" в разработке`);
  };

  const openPayments = (client: Client) => {
    setSelectedClient(client);
  };

  useEffect(() => {
    loadClients();
  }, []);

  if (selectedClient) {
    return (
      <ClientPayments
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
      />
    );
  }

  return (
    <Container>
      <Title order={2} mb="md">
        Клиенты
      </Title>

      {loading ? (
        <Loader />
      ) : error ? (
        <Text color="red" size="md">
          {error}
        </Text>
      ) : (
        <Stack>
          {clients.map((client) => {
            const block = blockMap[client.id];
            const remaining =
              typeof block?.used === 'number' && typeof block?.paidTrainings === 'number'
                ? block.paidTrainings - block.used
                : 0;
            const blockEnded = !block || block.used >= block.paidTrainings;
            const isEditing = editingId === client.id;

            return (
              <Card key={client.id} withBorder shadow="xs" radius="md" p="md">
                <Group position="apart" mb="xs">
                  <div>
                    <Text fw={500} component="span">
                      {client.name}{' '}
                      {isEditing ? (
                        <TextInput
                          value={internalTagValue}
                          onChange={(e) => setInternalTagValue(e.currentTarget.value)}
                          size="xs"
                          style={{ display: 'inline-block', width: 120 }}
                          placeholder="Доп. имя"
                        />
                      ) : client.internalTag ? (
                        `(${client.internalTag})`
                      ) : (
                        ''
                      )}
                    </Text>
                  </div>
                  <Text size="sm" color="dimmed">
                    {client.age} лет
                  </Text>
                </Group>

                {block ? (
                  <Group spacing="xs" mb="xs">
                    <Badge color={blockEnded ? 'red' : 'green'}>
                      Осталось: {remaining}
                    </Badge>
                    <Badge color="teal">Цена: {block.pricePerTraining ?? 0} ₽</Badge>
                  </Group>
                ) : (
                  <Text size="sm" color="dimmed" mb="xs">
                    Нет активной оплаты
                  </Text>
                )}

                {blockEnded && (
                  <Text color="red" fw={600} mb="xs">
                    <IconAlertTriangle
                      size={16}
                      style={{ verticalAlign: 'middle', marginRight: 6 }}
                    />
                    Требуется новый блок
                  </Text>
                )}

                <Stack mt="xs" spacing="xs">
                  <Group grow>
                    <Button color="blue" onClick={() => viewClient(client)}>
                      Питание
                    </Button>
                    <Button color="teal" onClick={() => openPayments(client)}>
                      💸 Оплата
                    </Button>
                  </Group>
                  <Group grow>
                    {isEditing ? (
                      <>
                        <Button
                          color="green"
                          leftIcon={<IconCheck size={16} />}
                          onClick={() => saveInternalTag(client.id)}
                        >
                          Сохранить
                        </Button>
                        <Button
                          color="gray"
                          leftIcon={<IconX size={16} />}
                          onClick={cancelEditing}
                        >
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          color="yellow"
                          variant="outline"
                          size="sm"
                          style={{
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          onClick={() => onOpenHistory(client.id)}
                        >
                          📊 История оплат 💸
                        </Button>
                        <Button
                          color="orange"
                          leftIcon={<IconEdit size={16} />}
                          onClick={() => startEditing(client)}
                        >
                          Псевдоним
                        </Button>
                        <Button color="red" onClick={() => deleteClient(client.id)}>
                          Удалить
                        </Button>
                      </>
                    )}
                  </Group>
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
