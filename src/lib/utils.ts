export function formatHours(milliseconds: number | undefined): string {
  if (!milliseconds) return "0.0";
  const hours = milliseconds / (1000 * 60 * 60);

  if (hours < 0.1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }

  return hours.toFixed(1);
}
