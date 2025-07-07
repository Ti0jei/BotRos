import { DatePickerInput } from "@mantine/dates";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Dayjs } from "dayjs";
import "dayjs/locale/ru";

export default function CustomModalDatePicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (d: Date) => void;
}) {
  return (
    <DatePickerInput
      label="Дата"
      locale="ru"
      value={value}
      onChange={(date) => date && onChange(date)}
      clearable
      clearButtonLabel="Очистить"
      placeholder="Выберите дату"
      size="md"
      variant="default"
      dropdownType="modal"
      firstDayOfWeek={1}
      hideWeekdays={false}
      nextIcon={<IconChevronRight size={16} />}
      previousIcon={<IconChevronLeft size={16} />}
      popoverProps={{
        withinPortal: true,
        shadow: "md",
        radius: "md",
      }}
      styles={{
        input: {
          borderRadius: 12,
          border: "1px solid #000",
          fontWeight: 500,
          backgroundColor: "#fff",
        },
        label: {
          marginBottom: 4,
          fontSize: 14,
          fontWeight: 600,
          color: "#666",
        },
      }}
    />
  );
}
