// frontend/pages/AdminClients/ClientDrawer.tsx
import { Drawer, Stack, Button } from "@mantine/core";

interface ClientDrawerProps {
  opened: boolean;
  onClose: () => void;
  clientId: string | null;
  setView: (v: string) => void;
  buttonStyle: any;
}

export default function ClientDrawer({
  opened,
  onClose,
  clientId,
  setView,
  buttonStyle,
}: ClientDrawerProps) {
  const handleAction = (action: "workouts" | "create-workout" | "exercise-admin") => {
    if (action !== "exercise-admin" && !clientId) return;
    if (clientId) {
      localStorage.setItem("clientId", clientId);
    }
    setView(action);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Тренировки клиента"
      padding="md"
      size="md"
    >
      <Stack>
        <Button
          styles={buttonStyle}
          onClick={() => handleAction("workouts")}
        >
          Программа тренировок
        </Button>

        <Button
          styles={buttonStyle}
          onClick={() => handleAction("create-workout")}
        >
          Создать шаблон
        </Button>

        <Button
          styles={buttonStyle}
          onClick={() => handleAction("exercise-admin")}
        >
          Упражнения
        </Button>
      </Stack>
    </Drawer>
  );
}
