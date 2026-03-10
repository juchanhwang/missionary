export function maskIdentityNumber(identityNumber: string | null): string {
  if (!identityNumber) return '-';
  if (identityNumber.length >= 7) {
    return `${identityNumber.slice(0, 6)}-${identityNumber.charAt(6)}${'*'.repeat(6)}`;
  }
  return identityNumber;
}
