import { useEffect, useState } from "react";
import { Button, Modal, Group, Stack } from "@mantine/core";
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
        size="auto"
        styles={{
          content: {
            padding: 0,
            minWidth: 340,
            width: "fit-content",
            borderRadius: 20,
            overflow: "hidden",
          },
        }}
      >
        <Stack p="md" style={{ width: "100%" }}>
          <DatePicker
            locale="ru"
            value={date.toDate()}
            onChange={(selected) => {
              if (selected) {
                setDate(dayjs(selected));
                setOpened(false); // <<< Автоматическое закрытие
              }
            }}
            size="md"
            styles={{
              day: (theme, date, modifiers) => ({
                backgroundColor: modifiers.selected
                  ? "#1976d2"
                  : modifiers.today
                  ? "#e3f2fd"
                  : "transparent",
                color: modifiers.selected ? "#fff" : "#000",
                borderRadius: 8,
                fontWeight: 500,
                transition: "all 0.15s ease",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }),
              calendarHeader: {
                justifyContent: "center",
                fontWeight: 600,
              },
            }}
          />
        </Stack>
      </Modal>
    </>
  );
}
