import { Button, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';

export default function ScheduleHeader({
  date,
  setDate,
}: {
  date: Dayjs;
  setDate: (d: Dayjs) => void;
}) {
  return (
    <Group position="center" spacing="xs" mb="md">
      <Button
        size="xs"
        variant="default"
        onClick={() => setDate(date.subtract(1, 'day'))}
        leftIcon={<IconChevronLeft size={14} />}
      >
        Назад
      </Button>

      <DatePickerInput
        value={date.toDate()}
        onChange={(val) => val && setDate(dayjs(val))}
        clearable={false}
        dropdownType="popover"
        size="xs"
        nextIcon={<IconChevronRight size={16} />}
        previousIcon={<IconChevronLeft size={16} />}
        popoverProps={{ withinPortal: true, shadow: 'md', radius: 'md' }}
        styles={{ input: { textAlign: 'center', minWidth: 120 } }}
      />

      <Button
        size="xs"
        variant="default"
        onClick={() => setDate(date.add(1, 'day'))}
        rightIcon={<IconChevronRight size={14} />}
      >
        Вперёд
      </Button>
    </Group>
  );
}
