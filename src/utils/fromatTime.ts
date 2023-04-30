import dayjs from "dayjs";

export default function formatTime(time: string | number) {
  if (!time) return "";

  const timeStr = dayjs(time).format("YYYY-MM-DD HH:mm:ss");

  return timeStr;
}
