import { useEffect } from "react";
import { Button, Group } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";

import CustomModalDatePicker from "@/components/ui/CustomModalDatePicker";

export default function ScheduleHeader({
  date,
  setDate,
}: {
  date: Dayjs;
  setDate: (d: Dayjs) => void;
}) {
  useEffect(() => {
    dayjs.locale("ru");
  }, []);

  const outlineStyle = {
    root: {
      color: "#000",
      border: "1px solid #000",
      borderRadius: 12,
      backgroundColor: "#fff",
      fontWeight: 500,
      transition: "background 0.2s",
      "&:hover": { backgroundColor: "#f2f2f2" },
    },
  };

  return (
    <Group position="center" spacing="xs" mb="md">
      <Button
        size="xs"
        leftIcon={<IconChevronLeft size={14} />}
        onClick={() => setDate(date.subtract(1, "day"))}
        variant="outline"
        styles={outlineStyle}
      >
        Назад
      </Button>

      <CustomModalDatePicker date={date} setDate={setDate} />

      <Button
        size="xs"
        rightIcon={<IconChevronRight size={14} />}
        onClick={() => setDate(date.add(1, "day"))}
        variant="outline"
        styles={outlineStyle}
      >
        Вперёд
      </Button>
    </Group>
  );
}
