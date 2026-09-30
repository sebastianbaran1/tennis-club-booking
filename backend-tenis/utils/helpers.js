export const timeToMinutes = (timeString) => {
  if (!timeString || typeof timeString !== "string" || timeString === "--:--") {
    return 0;
  }
  if (timeString === "00:00") return 24 * 60;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};
