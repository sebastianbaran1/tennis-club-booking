export const timeToMinutes = (timeString) => {
  if (!timeString || typeof timeString !== "string" || timeString === "--:--") {
    return 0;
  }
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};
