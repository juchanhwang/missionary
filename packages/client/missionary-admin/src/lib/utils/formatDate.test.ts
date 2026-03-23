import { formatDate, formatDateDotted } from './formatDate';

describe('formatDate', () => {
  it('ISO 날짜 문자열에서 날짜 부분만 추출한다', () => {
    expect(formatDate('2024-07-15')).toBe('2024-07-15');
  });

  it('날짜만 있는 문자열을 그대로 반환한다', () => {
    expect(formatDate('2024-07-15')).toBe('2024-07-15');
  });

  it('null이면 "-"을 반환한다', () => {
    expect(formatDate(null)).toBe('-');
  });
});

describe('formatDateDotted', () => {
  it('날짜 문자열을 "YYYY.MM.DD" 형식으로 변환한다', () => {
    expect(formatDateDotted('2024-07-15')).toBe('2024.07.15');
  });

  it('한 자리 월과 일을 두 자리로 포맷한다', () => {
    expect(formatDateDotted('2024-01-05')).toBe('2024.01.05');
  });

  it('ISO 8601 형식의 날짜를 처리한다', () => {
    expect(formatDateDotted('2024-12-25')).toBe('2024.12.25');
  });

  it('점 뒤의 공백과 마지막 점을 제거한다', () => {
    const result = formatDateDotted('2024-07-15');
    expect(result).not.toContain('. ');
    expect(result).not.toMatch(/\.$/);
  });

  it('null이면 "-"을 반환한다', () => {
    expect(formatDateDotted(null)).toBe('-');
  });
});
