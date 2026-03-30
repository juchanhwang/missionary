import {
  formatBirthDate,
  formatDate,
  formatDateTime,
  maskIdentificationNumber,
} from './formatParticipant';

describe('formatDate', () => {
  it('날짜 문자열을 한국어 날짜 형식으로 변환한다', () => {
    const result = formatDate('2026-03-15T00:00:00.000Z');

    expect(result).toMatch(/2026/);
    expect(result).toMatch(/03/);
    expect(result).toMatch(/15/);
  });
});

describe('formatDateTime', () => {
  it('날짜 문자열을 한국어 날짜+시간 형식으로 변환한다', () => {
    const result = formatDateTime('2026-03-15T14:30:00.000Z');

    expect(result).toMatch(/2026/);
    expect(result).toMatch(/03/);
    expect(result).toMatch(/15/);
  });
});

describe('formatBirthDate', () => {
  it('생년월일 문자열을 한국어 날짜 형식으로 변환한다', () => {
    const result = formatBirthDate('1999-01-01T00:00:00.000Z');

    expect(result).toMatch(/1999/);
    expect(result).toMatch(/01/);
  });
});

describe('maskIdentificationNumber', () => {
  it('주민등록번호를 마스킹한다 (하이픈 포함)', () => {
    const result = maskIdentificationNumber('990101-1234567');

    expect(result).toBe('990101-1******');
  });

  it('주민등록번호를 마스킹한다 (하이픈 없음)', () => {
    const result = maskIdentificationNumber('9901011234567');

    expect(result).toBe('990101-1******');
  });

  it('7자리 미만이면 원본을 그대로 반환한다', () => {
    const result = maskIdentificationNumber('990101');

    expect(result).toBe('990101');
  });

  it('빈 문자열이면 그대로 반환한다', () => {
    const result = maskIdentificationNumber('');

    expect(result).toBe('');
  });
});
