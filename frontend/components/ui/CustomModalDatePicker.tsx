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
    console.log("✅ CustomModalDatePicker: загружен и работает");
    dayjs.locale("ru");
  }, []);

  return (
    <>
      <Group position="center" spacing="xs" mt="sm">
        <Button
          size="xs"
          variant="outline"
          onClick={() => setDate(date.subtract(1, "day"))}
        >
          Назад
        </Button>

        <Button size="xs" variant="outline" onClick={() => setOpened(true)}>
          {date.format("DD.MM.YYYY")}
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
        withCloseButton={false}
        size="auto"
        styles={{
          content: {
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            width: "fit-content",
          },
        }}
      >
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
          styles={{
            calendarHeader: {
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 16,
              paddingBottom: 8,
            },
            weekday: {
              fontWeight: 600,
              fontSize: 13,
              color: "#333",
            },
            day: (theme, _date, modifiers) => ({
              backgroundColor: modifiers.selected
                ? "#1a1a1a"
                : modifiers.today
                ? "#f2f2f2"
                : "transparent",
              color: modifiers.selected ? "#fff" : "#000",
              borderRadius: "8px !important",
              fontWeight: 500,
              height: 36,
              width: 36,
              lineHeight: "36px",
              transition: "all 0.15s ease",
              border:
                modifiers.selected || modifiers.today
                  ? "1px solid #1a1a1a"
                  : "1px solid transparent",
              "&:hover": {
                backgroundColor: "#eaeaea !important",
              },
            }),
          }}
        />
      </Modal>
    </>
  );
}
