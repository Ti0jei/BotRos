import { useEffect, useState } from "react";
import {
  Modal,
  Group,
  Button,
  Grid,
  Text,
  Center,
  Box,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.locale("ru");

const weekDays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export default function CustomModalDatePicker({
  date,
  setDate,
}: {
  date: string; // 🔧 теперь строка
  setDate: (d: string) => void; // 🔧 передаём строку
}) {
  const [opened, setOpened] = useState(false);
  const [viewMonth, setViewMonth] = useState(dayjs(date).startOf("month"));

  useEffect(() => {
    setViewMonth(dayjs(date).startOf("month"));
  }, [date]);

  const startDay = viewMonth.startOf("week");
  const endDay = viewMonth.endOf("month").endOf("week");

  const dayList: Dayjs[] = [];
  let day = startDay.clone();
  while (day.isBefore(endDay, "day")) {
    dayList.push(day);
    day = day.add(1, "day");
  }

  const isSameDay = (a: Dayjs, b: string) =>
    a.format("YYYY-MM-DD") === b;

  return (
    <>
      <Group position="center" spacing="xs" mt="sm">
        <Button
          size="xs"
          variant="outline"
          color="dark"
          onClick={() => setDate(dayjs(date).subtract(1, "day").format("YYYY-MM-DD"))}
        >
          Назад
        </Button>

        <Button
          size="xs"
          variant="outline"
          color="dark"
          onClick={() => setOpened(true)}
        >
          {dayjs(date).format("DD.MM.YYYY")}
        </Button>

        <Button
          size="xs"
          variant="outline"
          color="dark"
          onClick={() => setDate(dayjs(date).add(1, "day").format("YYYY-MM-DD"))}
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
            padding: 24,
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
            width: "100%",
            maxWidth: 400,
            margin: "0 auto",
          },
        }}
      >
        <Group position="apart" align="center" mb="sm" noWrap>
          <Button
            variant="subtle"
            color="dark"
            onClick={() => setViewMonth(viewMonth.subtract(1, "month"))}
            compact
          >
            <IconChevronLeft size={20} />
          </Button>

          <Text
            fw={600}
            size="lg"
            style={{ flex: 1, textAlign: "center", textTransform: "capitalize" }}
          >
            {viewMonth.format("MMMM YYYY")}
          </Text>

          <Button
            variant="subtle"
            color="dark"
            onClick={() => setViewMonth(viewMonth.add(1, "month"))}
            compact
          >
            <IconChevronRight size={20} />
          </Button>
        </Group>

        <Grid gutter="xs" grow>
          {weekDays.map((dayName) => (
            <Grid.Col span={1} key={dayName}>
              <Center>
                <Text fw={600} size="sm">
                  {dayName}
                </Text>
              </Center>
            </Grid.Col>
          ))}
        </Grid>

        <Grid gutter="xs" grow mt="xs">
          {dayList.map((d) => {
            const isCurrentMonth = d.month() === viewMonth.month();
            const selected = isSameDay(d, date);

            return (
              <Grid.Col span={1} key={d.toString()}>
                <Center>
                  <Box
                    onClick={() => {
                      setDate(d.format("YYYY-MM-DD")); // ✅ форматируем перед сохранением
                      setOpened(false);
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: selected
                        ? "#1a1a1a"
                        : !isCurrentMonth
                        ? "#f0f0f0"
                        : "transparent",
                      color: selected
                        ? "#fff"
                        : isCurrentMonth
                        ? "#000"
                        : "#999",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {d.date()}
                  </Box>
                </Center>
              </Grid.Col>
            );
          })}
        </Grid>
      </Modal>
    </>
  );
}
