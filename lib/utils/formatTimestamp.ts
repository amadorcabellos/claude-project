// short month, day and 12-hour time, e.g. "Nov 28, 03:30 PM"
export function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
