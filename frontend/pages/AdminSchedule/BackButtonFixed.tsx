import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

export default function BackButtonFixed({ onClick }: { onClick: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        left: 0,
        width: '100%',
        background: 'white',
        padding: '8px 0',
        textAlign: 'center',
        boxShadow: '0 -2px 6px rgba(0,0,0,0.05)',
        zIndex: 1000,
      }}
    >
      <Button
        variant="subtle"
        color="blue"
        size="sm"
        onClick={onClick}
        leftIcon={<IconArrowLeft size={16} />}
      >
        Назад к профилю
      </Button>
    </div>
  );
}
