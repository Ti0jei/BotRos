import { useEffect, useState } from "react";
import { Modal, Group, Button } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
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
        <Button size="xs" variant="outline" onClick={() => setDate(date.subtract(1, "day"))}>
          Назад
        </Button>

        <Button size="xs" variant="outline" onClick={() => setOpened(true)}>
          {date.format("DD.MM.YYYY")}
        </Button>

        <Button size="xs" variant="outline" onClick={() => setDate(date.add(1, "day"))}>
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
          nextIcon={<IconChevronRight size={16} />}
          previousIcon={<IconChevronLeft size={16} />}
          classNames={{
            day: "custom-day",
            weekday: "custom-weekday",
            calendarHeader: "custom-header",
          }}
        />
      </Modal>
    </>
  );
}
