import { Button, Group } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";

export default function ScheduleHeader({
  date,
  setDate,
}: {
  date: Dayjs;
  setDate: (d: Dayjs) => void;
}) {
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

      <DatePickerInput
        value={date.toDate()}
        onChange={(val) => val && setDate(dayjs(val))}
        clearable={false}
        dropdownType="popover"
        size="xs"
        hideWeekdays
        nextIcon={<IconChevronRight size={14} />}
        previousIcon={<IconChevronLeft size={14} />}
        popoverProps={{ withinPortal: true, shadow: "md", radius: "md" }}
        styles={{
          input: {
            textAlign: "center",
            borderRadius: 12,
            fontWeight: 600,
            border: "1px solid #000",
            minWidth: 120,
          },
        }}
      />

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
