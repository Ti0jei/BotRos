// components/ui/CustomModalDatePicker.tsx

import { useEffect, useState } from "react";
import { Button, Modal, Stack, Group } from "@mantine/core";
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
    setDate(dayjs());
    setOpened(false);
  };

  const buttonStyle = {
    root: {
      color: "#1a1a1a",
      border: "1px solid #1a1a1a",
      borderRadius: 12,
      backgroundColor: "#fff",
      fontWeight: 500,
      transition: "background 0.2s",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  return (
    <>
      <Group position="center" spacing="xs">
        <Button
          size="xs"
          variant="outline"
          styles={buttonStyle}
          onClick={() => setDate(date.subtract(1, "day"))}
        >
          Назад
        </Button>

        <Button
          size="xs"
          variant="outline"
          styles={buttonStyle}
          onClick={() => setOpened(true)}
        >
          {date.format("DD.MM.YYYY")}
        </Button>

        <Button
          size="xs"
          variant="outline"
          styles={buttonStyle}
          onClick={() => setDate(date.add(1, "day"))}
        >
          Вперёд
        </Button>
      </Group>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        radius="xl"
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
            styles={{
              day: { fontWeight: 500 },
              weekday: { fontWeight: 600 },
              calendarHeaderControl: {
                color: "#1a1a1a",
              },
            }}
          />

          <Group position="apart" mt="md">
            <Button variant="outline" color="red" styles={buttonStyle} onClick={handleClear}>
              Удалить
            </Button>
            <Button variant="outline" styles={buttonStyle} onClick={() => setOpened(false)}>
              Отмена
            </Button>
            <Button styles={buttonStyle} onClick={handleApply}>
              Установить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
