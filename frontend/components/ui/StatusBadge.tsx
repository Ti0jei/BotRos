// StatusBadge.tsx
import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'declined';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const map = {
    active: { color: 'pink', label: 'Активно' },
    pending: { color: 'yellow', label: 'Ожидает' },
    declined: { color: 'gray', label: 'Отменено' },
  };

  return (
    <Badge color={map[status].color} radius="sm" variant="filled">
      {map[status].label}
    </Badge>
  );
}
