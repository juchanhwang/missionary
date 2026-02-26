import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('날짜 문자열을 "YYYY.MM.DD" 형식으로 변환한다', () => {
    expect(formatDate('2024-07-15')).toBe('2024.07.15');
  });

  it('한 자리 월과 일을 두 자리로 포맷한다', () => {
    expect(formatDate('2024-01-05')).toBe('2024.01.05');
  });

  it('ISO 8601 형식의 날짜를 처리한다', () => {
    const result = formatDate('2024-12-25T12:00:00.000Z');

    expect(result).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });

  it('점 뒤의 공백과 마지막 점을 제거한다', () => {
    const result = formatDate('2024-07-15');

    expect(result).not.toContain('. ');
    expect(result).not.toMatch(/\.$/);
  });
});
