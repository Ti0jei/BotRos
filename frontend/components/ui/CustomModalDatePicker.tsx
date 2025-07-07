import { useEffect, useState } from "react";
import { Button, Modal, Stack, Group, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";

export default function CustomModalDatePicker({
  date,
  setDate,
}: {
  date: Dayjs;
  setDate: (d: Dayjs) => void;
}) {
  const [opened, setOpened] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(date.toDate());

  useEffect(() => {
    dayjs.locale("ru");
  }, []);

  const handleApply = () => {
    if (tempDate) {
      setDate(dayjs(tempDate));
    }
    setOpened(false);
  };

  const handleClear = () => {
    setTempDate(null);
    setDate(dayjs()); // Можно сбросить в today или null, если логика позволяет
    setOpened(false);
  };

  return (
    <>
      <Group position="center" spacing="xs">
        <Button
          size="xs"
          variant="outline"
          onClick={() => setDate(date.subtract(1, "day"))}
        >
          Назад
        </Button>

        <Button
          size="xs"
          variant="outline"
          onClick={() => setOpened(true)}
        >
          {date.format("D MMMM, YYYY")}
        </Button>

        <Button
          size="xs"
          variant="outline"
          onClick={() => setDate(date.add(1, "day"))}
        >
          Вперёд
        </Button>
      </Group>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        radius="md"
        withCloseButton={false}
        overlayProps={{ blur: 4 }}
      >
        <Stack>
          <DatePicker
            locale="ru"
            value={tempDate}
            onChange={setTempDate}
            size="md"
            fullWidth
          />

          <Group position="apart" mt="md">
            <Button variant="subtle" color="red" onClick={handleClear}>
              Удалить
            </Button>
            <Button variant="default" onClick={() => setOpened(false)}>
              Отмена
            </Button>
            <Button onClick={handleApply}>Установить</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
