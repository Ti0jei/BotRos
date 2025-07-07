import { useEffect, useState } from "react";
import { Button, Modal, Group } from "@mantine/core";
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
        <div style={{ width: 320 }}>
          <DatePicker
            locale="ru"
            value={date.toDate()}
            onChange={(selected) => {
              if (selected) {
                setDate(dayjs(selected));
                setOpened(false);
              }
            }}
            size="md"
            fullWidth
            styles={{
              root: { width: "100%" },
              calendar: { width: "100%" },
              calendarBase: { width: "100%" },
              day: { fontWeight: 500 },
              weekday: { fontWeight: 600 },
              calendarHeaderControl: {
                color: "#1a1a1a",
                width: 32,
                height: 32,
                minHeight: 32,
                minWidth: 32,
                padding: 0,
                svg: {
                  width: 20,
                  height: 20,
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: "none",
                },
              },
            }}
          />
        </div>
      </Modal>
    </>
  );
}
