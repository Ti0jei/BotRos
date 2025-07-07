import { useEffect, useState } from "react";
import { Button, Modal, Stack, Group, Box } from "@mantine/core";
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
      <Group position="center" spacing="xs" mt="sm">
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
          onClick={() => {
            setTempDate(date.toDate());
            setOpened(true);
          }}
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
        size={360} // 👈 фиксированная ширина модалки
      >
        <Box style={{ minWidth: 340 }}> {/* 👈 обёртка с нужной шириной */}
          <DatePicker
            locale="ru"
            value={tempDate}
            onChange={(d) => {
              if (d) {
                setTempDate(d);
                setDate(dayjs(d));
                setOpened(false);
              }
            }}
            size="md"
            styles={{
              day: { fontWeight: 500 },
              weekday: { fontWeight: 600 },
              calendarHeaderControl: {
                color: "#1a1a1a",
                width: 32,
                height: 32,
                padding: 0,
                svg: { width: 20, height: 20 },
                "&:focus": { outline: "none", boxShadow: "none" },
              },
            }}
          />
        </Box>
      </Modal>
    </>
  );
}
