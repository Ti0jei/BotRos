import { useEffect, useState } from "react";
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
  Divider,
  Center,
} from "@mantine/core";
import {
  IconCash,
  IconChefHat,
  IconGift,
  IconPencil,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";

import ClientPayments from "./ClientPayments";
import ClientNutrition from "./ClientNutrition";

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
  setView,
}: {
  onBack: () => void;
  onOpenHistory: (userId: string) => void;
  setView: (v: string) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [view, internalViewSet] = useState<"payments" | "nutrition" | null>(null);
  const [blockMap, setBlockMap] = useState<Record<string, PaymentBlock | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [internalTagValue, setInternalTagValue] = useState<string>("");

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const buttonStyle = {
    root: {
      color: "#1a1a1a",
      border: "1px solid #1a1a1a",
      borderRadius: 12,
      fontWeight: 500,
      backgroundColor: "#fff",
      transition: "background 0.2s",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  const loadClients = async () => {
    try {
      const res = await fetch(`${API}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!Array.isArray(data)) {
        setError("Ошибка доступа или авторизации");
        setClients([]);
        setLoading(false);
        return;
      }
      setClients(data);
      setLoading(false);
      for (const client of data) loadBlock(client.id);
    } catch (err) {
      console.error("Ошибка запроса:", err);
      setError("Сервер недоступен");
      setLoading(false);
    }
  };

  const loadBlock = async (userId: string) => {
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
    if (!window.confirm("Вы точно хотите удалить клиента?")) return;
    await fetch(`${API}/api/clients/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadClients();
  };

  const startEditing = (client: Client) => {
    setEditingId(client.id);
    setInternalTagValue(client.internalTag ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setInternalTagValue("");
  };

  const saveInternalTag = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/clients/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ internalTag: internalTagValue }),
      });
      if (res.ok) {
        loadClients();
        cancelEditing();
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (err) {
      console.error("Ошибка при PATCH /clients/:id", err);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  if (selectedClient && view === "payments") {
    return (
      <ClientPayments
        client={selectedClient}
        onBack={() => {
          setSelectedClient(null);
          internalViewSet(null);
        }}
      />
    );
  }

  if (selectedClient && view === "nutrition") {
    return (
      <ClientNutrition
        userId={selectedClient.id}
        isAdmin={true}
        onBack={() => {
          setSelectedClient(null);
          internalViewSet(null);
        }}
      />
    );
  }

  return (
    <Box style={{ backgroundColor: "#f7f7f7", minHeight: "100vh", paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={3} c="#1a1a1a" mb="md">
          Клиенты
        </Title>

        {loading ? (
          <Center my="lg">
            <Loader size="sm" />
          </Center>
        ) : error ? (
          <Text color="red">{error}</Text>
        ) : (
          <Stack spacing="md">
            {clients.map((client) => {
              const block = blockMap[client.id];
              const remaining = block ? block.paidTrainings - block.used : 0;
              const isEditing = editingId === client.id;

              return (
                <Card key={client.id} withBorder radius="xl" p="md" shadow="xs">
                  <Stack spacing="xs">
                    <Group position="apart">
                      <Text fw={600}>
                        {client.name} {client.lastName ?? ""}
                        {client.internalTag && (
                          <Text span c="dimmed"> ({client.internalTag}) </Text>
                        )}
                      </Text>
                      <Box
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: block ? "green" : "#999",
                        }}
                      />
                    </Group>

                    <Text size="sm" c="dimmed">
                      {client.age} лет
                    </Text>

                    {isEditing ? (
                      <Stack spacing="xs">
                        <TextInput
                          value={internalTagValue}
                          onChange={(e) => setInternalTagValue(e.currentTarget.value)}
                          placeholder="Доп. имя"
                          radius="xl"
                        />
                        <Group grow mt="xs">
                          <Button
                            onClick={() => saveInternalTag(client.id)}
                            styles={buttonStyle}
                          >
                            Сохранить
                          </Button>
                          <Button
                            variant="outline"
                            color="gray"
                            onClick={cancelEditing}
                            styles={buttonStyle}
                          >
                            Отмена
                          </Button>
                        </Group>
                      </Stack>
                    ) : (
                      <>
                        {block && (
                          <Group spacing="xs">
                            <Badge color={remaining === 0 ? "red" : "green"}>
                              Осталось: {remaining}
                            </Badge>
                            <Badge color="gray">Цена: {block.pricePerTraining} ₽</Badge>
                          </Group>
                        )}

                        <Group grow mt="xs">
                          <Button
                            styles={buttonStyle}
                            leftIcon={<IconChefHat size={16} />}
                            onClick={() => {
                              setSelectedClient(client);
                              internalViewSet("nutrition");
                            }}
                          >
                            Питание
                          </Button>
                          <Button
                            styles={buttonStyle}
                            leftIcon={<IconCash size={16} />}
                            onClick={() => {
                              setSelectedClient(client);
                              internalViewSet("payments");
                            }}
                          >
                            Оплата
                          </Button>
                        </Group>

                        <Group grow mt={6}>
                          <Button
                            styles={buttonStyle}
                            leftIcon={<IconGift size={16} />}
                            onClick={() => onOpenHistory(client.id)}
                          >
                            История оплат
                          </Button>
                        </Group>

                        <Group grow mt={6}>
                          <Button
                            styles={buttonStyle}
                            leftIcon={<IconPlus size={16} />}
                            onClick={() => {
                              localStorage.setItem("assignUserId", client.id);
                              localStorage.setItem("assignSinglePaid", (!block).toString());
                              setView("assign-training");
                            }}
                          >
                            Записать на тренировку
                          </Button>
                        </Group>

                        <Group grow mt={6}>
                          <Button
                            styles={buttonStyle}
                            leftIcon={<IconPencil size={16} />}
                            onClick={() => startEditing(client)}
                          >
                            Псевдоним
                          </Button>
                          <Button
                            styles={buttonStyle}
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

        <Divider my="lg" />

        <Box
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            background: "white",
            padding: "10px 16px",
            boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
            zIndex: 1000,
          }}
        >
          <Box style={{ maxWidth: 420, margin: "0 auto" }}>
            <Button
              onClick={onBack}
              variant="outline"
              fullWidth
              styles={buttonStyle}
              leftIcon={<span style={{ fontSize: 16 }}>←</span>}
            >
              Назад к профилю
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
