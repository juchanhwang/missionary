import { getSelectValue } from './getSelectValue';

describe('getSelectValue', () => {
  it('문자열 값을 그대로 반환한다', () => {
    expect(getSelectValue<'ADMIN' | 'USER'>('ADMIN')).toBe('ADMIN');
  });

  it('null이면 빈 문자열을 반환한다', () => {
    expect(getSelectValue(null)).toBe('');
  });

  it('undefined이면 빈 문자열을 반환한다', () => {
    expect(getSelectValue(undefined)).toBe('');
  });

  it('배열이면 빈 문자열을 반환한다', () => {
    expect(getSelectValue(['a', 'b'])).toBe('');
  });

  it('빈 문자열을 그대로 반환한다', () => {
    expect(getSelectValue('')).toBe('');
  });

  it('fallback 값을 지정할 수 있다', () => {
    expect(getSelectValue(null, 'name')).toBe('name');
  });
});
