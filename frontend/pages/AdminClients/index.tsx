// frontend/pages/AdminClients/index.tsx
import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Stack,
  Text,
  Loader,
  Center,
  Divider,
  Box,
  Button,
} from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";

import { Client, PaymentBlock } from "./types";
import ClientCard from "./ClientCard";
import ClientDrawer from "./ClientDrawer";
import ClientPayments from "../ClientPayments";
import ClientNutrition from "../ClientNutrition";
import ExercisesPage from "../../admin/ExercisesPage";
import WorkoutTemplatesPage from "../../admin/workout-templates";
import CreateWorkoutTemplate from "../../admin/create";
import EditWorkoutTemplate from "../../admin/id";

export default function AdminClientsPage({
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
  const [view, setInternalView] = useState<
    | "payments"
    | "nutrition"
    | "exercise-admin"
    | "workouts"
    | "create-workout"
    | "edit-workout"
    | null
  >(null);
  const [isDrawerOpened, setIsDrawerOpened] = useState(false);
  const [blockMap, setBlockMap] = useState<Record<string, PaymentBlock | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [internalTagValue, setInternalTagValue] = useState<string>("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

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
    } catch {
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
    } catch {}
  };

  const deleteClient = async (id: string) => {
    if (!window.confirm("Вы точно хотите удалить клиента?")) return;
    try {
      await fetch(`${API}/api/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadClients();
    } catch {}
  };

  const toggleExpanded = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
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
          setInternalView(null);
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
          setInternalView(null);
        }}
      />
    );
  }

  if (selectedClient && view === "workouts") {
    return (
      <WorkoutTemplatesPage
        clientId={selectedClient.id}
        setView={setInternalView}
        setSelectedTemplateId={setSelectedTemplateId}
      />
    );
  }

  if (selectedClient && view === "create-workout") {
    return (
      <CreateWorkoutTemplate
        clientId={selectedClient.id}
        onCancel={() => {
          setInternalView(null);
        }}
      />
    );
  }

  if (selectedClient && view === "edit-workout" && selectedTemplateId) {
    return (
      <EditWorkoutTemplate
        templateId={selectedTemplateId}
        setView={setInternalView}
      />
    );
  }

  if (view === "exercise-admin") {
    return <ExercisesPage onBack={() => setInternalView(null)} />;
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
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                block={blockMap[client.id]}
                isEditing={editingId === client.id}
                isOpen={!!expandedCards[client.id]}
                internalTagValue={internalTagValue}
                buttonStyle={buttonStyle}
                onTagChange={(val) => setInternalTagValue(val)}
                onSaveTag={async () => {
                  try {
                    const res = await fetch(`${API}/api/clients/${client.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ internalTag: internalTagValue }),
                    });
                    if (res.ok) {
                      loadClients();
                      setEditingId(null);
                      setInternalTagValue("");
                    } else {
                      alert("Ошибка при сохранении");
                    }
                  } catch {}
                }}
                onCancelTag={() => {
                  setEditingId(null);
                  setInternalTagValue("");
                }}
                onStartEdit={() => {
                  setEditingId(client.id);
                  setInternalTagValue(client.internalTag ?? "");
                }}
                onDelete={() => deleteClient(client.id)}
                onOpenNutrition={() => {
                  setSelectedClient(client);
                  setInternalView("nutrition");
                }}
                onOpenPayments={() => {
                  setSelectedClient(client);
                  setInternalView("payments");
                }}
                onOpenHistory={() => onOpenHistory(client.id)}
                onAssign={() => {
                  localStorage.setItem("assignUserId", client.id);
                  const block = blockMap[client.id];
                  const isSinglePaid = !block || block.paidTrainings <= block.used;
                  localStorage.setItem("assignSinglePaid", String(isSinglePaid));

                  // ✅ сохраняем дату из календаря (если есть), иначе fallback на текущую
                  const calendarDate = localStorage.getItem("calendarSelectedDate");
                  const selectedDate = calendarDate ?? dayjs().format("YYYY-MM-DD");
                  localStorage.setItem("assignDate", selectedDate);

                  setView("assign-training");
                }}
                onToggleExpand={() => toggleExpanded(client.id)}
                onOpenDrawer={() => {
                  setSelectedClient(client);
                  setIsDrawerOpened(true);
                }}
              />
            ))}
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
              leftIcon={<IconChevronLeft size={16} />}
            >
              Назад к профилю
            </Button>
          </Box>
        </Box>

        <ClientDrawer
          opened={isDrawerOpened}
          onClose={() => setIsDrawerOpened(false)}
          clientId={selectedClient?.id || null}
          setView={setInternalView}
          buttonStyle={buttonStyle}
        />
      </Container>
    </Box>
  );
}
