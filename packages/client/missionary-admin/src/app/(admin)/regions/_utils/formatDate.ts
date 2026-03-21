export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return dateString.slice(0, 10);
}
