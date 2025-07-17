import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Loader,
  Box,
  Group,
  Checkbox,
  NumberInput,
} from "@mantine/core";
import CollapsibleCard from "../components/CollapsibleCard";

interface ExerciseEntry {
  definition?: {
    name: string;
  };
  weight?: number;
  reps?: number;
  sets?: number;
  comment?: string;
}

interface WorkoutTemplate {
  id: string;
  title: string;
  isGlobal: boolean;
  exercises: ExerciseEntry[];
  sequenceNumber?: number;
  isActive?: boolean;
}

export default function WorkoutTemplatesPage({
  clientId,
  setView,
  setSelectedTemplateId,
}: {
  clientId: string | null;
  setView: (v: string) => void;
  setSelectedTemplateId: (id: string) => void;
}) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const url = `${API}/api/workout-templates?clientId=${clientId ?? ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const rawTemplates: WorkoutTemplate[] = await res.json();

      const enriched = await Promise.all(
        rawTemplates.map(async (tpl) => {
          try {
            const res = await fetch(`${API}/api/workout-templates/${tpl.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const full = await res.json();
            return { ...tpl, ...full, exercises: full.exercises || [] };
          } catch {
            return { ...tpl, exercises: [] };
          }
        })
      );

      setTemplates(enriched);
    } catch (err) {
      console.error("Ошибка загрузки программы тренировок:", err);
      setError("Не удалось загрузить программы тренировок.");
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, update: Partial<WorkoutTemplate>) => {
    try {
      await fetch(`${API}/api/workout-templates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });
      fetchTemplates();
    } catch (err) {
      console.error("Ошибка обновления шаблона:", err);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!window.confirm("Вы точно хотите удалить этот шаблон?")) return;

    try {
      const res = await fetch(`${API}/api/workout-templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
      } else {
        alert("Не удалось удалить шаблон");
      }
    } catch (err) {
      console.error("Ошибка при удалении шаблона:", err);
      alert("Ошибка при удалении шаблона");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [clientId]);

  const buttonStyle = {
    root: {
      color: "#1a1a1a",
      border: "1px solid #1a1a1a",
      borderRadius: 12,
      fontWeight: 500,
      backgroundColor: "#fff",
      paddingLeft: 16,
      paddingRight: 16,
      minWidth: 120,
      transition: "background 0.2s",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  return (
    <Box style={{ backgroundColor: "#f7f7f7", minHeight: "100vh", paddingBottom: 80 }}>
      <Container size="xs" py="md">
        <Title order={3} mb="md">
          Программы тренировок
        </Title>

        {loading ? (
          <Loader size="sm" />
        ) : error ? (
          <Text color="red">{error}</Text>
        ) : templates.length === 0 ? (
          <Text size="sm" color="dimmed">Нет программ тренировок для отображения.</Text>
        ) : (
          <Stack spacing="sm">
            {templates.map((tpl) => (
              <CollapsibleCard
                key={tpl.id}
                title={tpl.title}
                badgeText={tpl.isGlobal ? "Общий" : "Личный"}
                badgeColor="gray"
                actions={
                  <Group grow>
                    <Button
                      variant="outline"
                      size="xs"
                      styles={buttonStyle}
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setView("edit-workout");
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      color="red"
                      styles={buttonStyle}
                      onClick={() => deleteTemplate(tpl.id)}
                    >
                      Удалить
                    </Button>
                  </Group>
                }
              >
                <Group spacing="sm" mt="xs">
                  <Checkbox
                    label="Активен"
                    checked={tpl.isActive}
                    onChange={(e) =>
                      updateTemplate(tpl.id, { isActive: e.currentTarget.checked })
                    }
                  />
                  <NumberInput
                    label="Очередность"
                    value={tpl.sequenceNumber}
                    min={1}
                    onChange={(value) => {
                      if (typeof value === "number") {
                        updateTemplate(tpl.id, { sequenceNumber: value });
                      }
                    }}
                    w={120}
                  />
                </Group>

                {tpl.exercises?.length ? (
                  <Stack spacing={6} mt="xs">
                    {tpl.exercises.map((ex, i) => (
                      <Box
                        key={i}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: 8,
                          padding: 8,
                          backgroundColor: "#fff",
                        }}
                      >
                        <Text fw={500}>{ex.definition?.name || "Без названия"}</Text>
                        <Text size="xs" color="dimmed">
                          Вес: {ex.weight || 0} кг | Повторы: {ex.reps || 0} | Подходы: {ex.sets || 0}
                        </Text>
                        {ex.comment && (
                          <Text size="xs" mt={4} c="dimmed">
                            Комментарий: {ex.comment}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">
                    Нет добавленных упражнений.
                  </Text>
                )}
              </CollapsibleCard>
            ))}
          </Stack>
        )}
      </Container>

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
            onClick={() => setView("clients")}
            variant="outline"
            fullWidth
            styles={buttonStyle}
            leftIcon={<span style={{ fontSize: 16 }}>←</span>}
          >
            Назад к клиентам
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
