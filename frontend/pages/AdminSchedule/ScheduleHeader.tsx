import { useEffect } from "react";
import { Group } from "@mantine/core";
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

  return (
    <Group position="center" spacing="xs" mb="md">
      <CustomModalDatePicker date={date} setDate={setDate} />
    </Group>
  );
}
