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
        <Button
          size="xs"
          variant="outline"
          color="dark"
          onClick={() => setDate(date.subtract(1, "day"))}
        >
          Назад
        </Button>

        <Button
          size="xs"
          variant="outline"
          color="dark"
          onClick={() => setOpened(true)}
        >
          {date.format("DD.MM.YYYY")}
        </Button>

        <Button
          size="xs"
          variant="outline"
          color="dark"
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
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
            width: "100%",
            maxWidth: 380,
            margin: "0 auto",
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
          size="xl"
          nextIcon={<IconChevronRight size={28} />}
          previousIcon={<IconChevronLeft size={28} />}
          styles={{
            calendar: {
              width: "100%",
              maxWidth: "100%",
            },
            calendarHeader: {
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 600,
              paddingBottom: 12,
            },
            weekday: {
              fontSize: 16,
              fontWeight: 600,
              textAlign: "center",
            },
            day: {
              width: 48,
              height: 48,
              lineHeight: "48px",
              fontSize: 16,
              fontWeight: 600,
            },
          }}
        />
      </Modal>
    </>
  );
}
