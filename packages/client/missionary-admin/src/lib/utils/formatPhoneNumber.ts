export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');

  // 대표번호: 1[5-9]XX-XXXX
  if (/^1[5-9]/.test(digits)) {
    const d = digits.slice(0, 8);
    if (d.length <= 4) return d;
    return `${d.slice(0, 4)}-${d.slice(4)}`;
  }

  // 서울: 02-XXX-XXXX (9자리) / 02-XXXX-XXXX (10자리)
  if (digits.startsWith('02')) {
    const d = digits.slice(0, 10);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }

  // 휴대폰: 01X-XXXX-XXXX (항상 3-4-4)
  if (/^01/.test(digits)) {
    const d = digits.slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  }

  // 지역번호: 0XX-XXX-XXXX (10자리) / 0XX-XXXX-XXXX (11자리)
  if (digits.startsWith('0')) {
    const d = digits.slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    if (d.length <= 10)
      return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  }

  return digits.slice(0, 11);
}

export function isValidKoreanPhone(value: string): boolean {
  const digits = value.replace(/-/g, '');
  return (
    // 휴대폰: 01[016789] + 7~8자리
    /^01[016789]\d{7,8}$/.test(digits) ||
    // 서울: 02 + 7~8자리
    /^02\d{7,8}$/.test(digits) ||
    // 지역/인터넷전화: 0[3-7]X + 7~8자리
    /^0[3-7]\d{8,9}$/.test(digits) ||
    // 대표번호: 1[5-9]XX + 4자리
    /^1[5-9]\d{6}$/.test(digits)
  );
}
