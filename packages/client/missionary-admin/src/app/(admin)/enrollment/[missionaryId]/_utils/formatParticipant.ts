export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatBirthDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function maskIdentificationNumber(idNumber: string): string {
  const digits = idNumber.replace(/-/g, '');
  if (digits.length < 7) return idNumber;
  const front = digits.slice(0, 6);
  const firstBack = digits[6];
  return `${front}-${firstBack}******`;
}
