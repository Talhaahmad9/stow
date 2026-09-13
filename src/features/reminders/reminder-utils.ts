const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function getDefaultReminderTime(nowMs: number = Date.now()): number {
  const nextHour = new Date(nowMs);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return nextHour.getTime();
}

export function formatReminderTime(reminderAt: number): string {
  const date = new Date(reminderAt);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const period = hours24 >= 12 ? "PM" : "AM";
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const formattedTime = `${hours12}:${minutes} ${period}`;

  if (isToday) {
    return `Today, ${formattedTime}`;
  }
  return `${day} ${month}, ${formattedTime}`;
}
