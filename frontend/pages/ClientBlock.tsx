import { useEffect, useState } from 'react';
import {
  Box,
  Title,
  Paper,
  Text,
  Badge,
  Group,
  Button,
  Stack,
  Loader,
} from '@mantine/core';
import { getToken } from '../utils/auth';
import { IconHome } from '@tabler/icons-react';
import BackToProfileButton from '../components/BackToProfileButton';

interface PaymentBlock {
  id: string;
  paidAt: string;
  paidTrainings: number;
  used: number;
  pricePerBlock?: number;
  active: boolean;
}

export default function ClientBlock({
  onBack,
  onToProfile,
}: {
  onBack: () => void;
  onToProfile: () => void;
}) {
  const [block, setBlock] = useState<PaymentBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = getToken();

  useEffect(() => {
    const loadBlock = async () => {
      if (!token) {
        setBlock(null);
        setErrorMessage('Токен отсутствует. Повторите вход.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/api/payment-blocks/user/me/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setBlock(data);
        } else {
          setBlock(null);
          setErrorMessage('У вас нет активного блока тренировок.');
        }
      } catch (error: any) {
        setBlock(null);
        setErrorMessage(error.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    loadBlock();
  }, []);

  return (
    <Box bg="#f5d4ca" mih="100vh" display="flex" justify="center">
      <Box
        bg="white"
        w="100%"
        maw={420}
        mih="100vh"
        display="flex"
        direction="column"
        pos="relative"
      >
        <Box px={24} py={32} pb={120} style={{ flex: 1 }}>
          <Title order={2} ta="center" mb="md" fw={700}>
            📦 Блок тренировок
          </Title>

          {loading ? (
            <Loader size="sm" mx="auto" />
          ) : !block ? (
            <Text ta="center" color="red" mt="md">
              ❌ {errorMessage || 'У вас нет активного блока тренировок.'}
            </Text>
          ) : (
            <Paper withBorder radius="md" shadow="sm" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={600}>Дата оплаты</Text>
                <Text>{new Date(block.paidAt).toLocaleDateString()}</Text>
              </Group>
              <Text size="sm" c="dimmed" mb={4}>
                Всего тренировок: <b>{block.paidTrainings}</b>
              </Text>
              <Text size="sm" c="dimmed" mb={4}>
                Использовано: <b>{block.used}</b>
              </Text>
              <Text size="sm" c="dimmed" mb={4}>
                Осталось: <b>{block.paidTrainings - block.used}</b>
              </Text>
              {block.pricePerBlock !== undefined && (
                <Text size="sm" c="dimmed" mb={4}>
                  Цена за блок: <b>{block.pricePerBlock} ₽</b>
                </Text>
              )}
              <Badge
                color={block.active ? 'green' : 'gray'}
                mt={8}
                size="lg"
                variant="light"
              >
                {block.active ? 'Активен' : 'Завершён'}
              </Badge>
            </Paper>
          )}
        </Box>

        <Box h={36} bg="white" pos="absolute" bottom={98} w="100%" zIndex={5} />

        <Box
          pos="fixed"
          bottom={0}
          left={0}
          w="100%"
          bg="white"
          py={16}
          pt={20}
          style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', zIndex: 10 }}
        >
          <Stack gap="sm" px={16} maw={420} mx="auto">
            <BackToProfileButton onBack={onBack} />
            <Button
              onClick={onToProfile}
              fullWidth
              leftIcon={<IconHome size={14} />}
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
              На главную
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
