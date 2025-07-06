// frontend/components/BackToProfileButton.tsx
import { Button } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';

interface BackToProfileButtonProps {
  onBack: () => void;
}

export default function BackToProfileButton({ onBack }: BackToProfileButtonProps) {
  return (
    <Button
      onClick={onBack}
      leftIcon={<IconArrowBack size={14} />}
      styles={{
        root: {
          color: '#d6336c',
          border: '1px solid #d6336c',
          borderRadius: 8,
          fontWeight: 500,
          backgroundColor: 'transparent',
          '&:hover': { backgroundColor: '#ffe3ed' },
        },
      }}
    >
      Назад к профилю
    </Button>
  );
}
