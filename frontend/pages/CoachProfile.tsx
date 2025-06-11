import { Button, Container, Title } from '@mantine/core';

interface CoachProfileProps {
  profile: { name: string };
  onLogout: () => void;
  onOpenSchedule: () => void;
  onOpenClients?: () => void;
}

export default function CoachProfile({ onLogout, onOpenSchedule, onOpenClients }: CoachProfileProps) {
  return (
    <Container>
      <Title order={2} mb="lg">Привет, Кристиночка 👋</Title>

      <Button fullWidth mb="sm" color="blue" onClick={onOpenClients}>
        Клиенты
      </Button>

      <Button fullWidth mb="sm" color="blue" onClick={onOpenSchedule}>
        Назначить тренировку
      </Button>

      <Button fullWidth mb="sm" disabled>
        Питание клиентов (скоро)
      </Button>

      <Button fullWidth mb="sm" disabled>
        Материалы (скоро)
      </Button>

      <Button fullWidth mt="lg" color="red" onClick={onLogout}>
        Выйти
      </Button>
    </Container>
  );
}
