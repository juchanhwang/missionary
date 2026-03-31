import { formatPhoneNumber, isValidKoreanPhone } from './formatPhoneNumber';

describe('formatPhoneNumber', () => {
  describe('휴대폰 (01X)', () => {
    it('010 번호를 3-4-4로 포맷팅한다', () => {
      expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
    });

    it('기존 하이픈이 있는 번호도 정상 포맷팅한다', () => {
      expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678');
    });

    it('11자리를 초과하면 11자리까지만 사용한다', () => {
      expect(formatPhoneNumber('010123456789999')).toBe('010-1234-5678');
    });

    it('입력 중 점진적으로 포맷팅한다', () => {
      expect(formatPhoneNumber('010')).toBe('010');
      expect(formatPhoneNumber('0101')).toBe('010-1');
      expect(formatPhoneNumber('0101234')).toBe('010-1234');
      expect(formatPhoneNumber('01012341')).toBe('010-1234-1');
    });
  });

  describe('서울 (02)', () => {
    it('9자리 번호를 2-3-4로 포맷팅한다', () => {
      expect(formatPhoneNumber('027559857')).toBe('02-755-9857');
    });

    it('10자리 번호를 2-4-4로 포맷팅한다', () => {
      expect(formatPhoneNumber('0212345678')).toBe('02-1234-5678');
    });

    it('입력 중 점진적으로 포맷팅한다', () => {
      expect(formatPhoneNumber('02')).toBe('02');
      expect(formatPhoneNumber('021')).toBe('02-1');
      expect(formatPhoneNumber('02123')).toBe('02-123');
      expect(formatPhoneNumber('021234')).toBe('02-123-4');
    });
  });

  describe('지역번호 (0XX)', () => {
    it('10자리 번호를 3-3-4로 포맷팅한다', () => {
      expect(formatPhoneNumber('0311234567')).toBe('031-123-4567');
    });

    it('11자리 번호를 3-4-4로 포맷팅한다', () => {
      expect(formatPhoneNumber('03112345678')).toBe('031-1234-5678');
    });

    it('입력 중 점진적으로 포맷팅한다', () => {
      expect(formatPhoneNumber('031')).toBe('031');
      expect(formatPhoneNumber('0311')).toBe('031-1');
      expect(formatPhoneNumber('031123')).toBe('031-123');
      expect(formatPhoneNumber('0311234')).toBe('031-123-4');
    });
  });

  describe('대표번호 (1XXX)', () => {
    it('8자리 번호를 4-4로 포맷팅한다', () => {
      expect(formatPhoneNumber('15881234')).toBe('1588-1234');
    });

    it('8자리를 초과하면 8자리까지만 사용한다', () => {
      expect(formatPhoneNumber('158812345')).toBe('1588-1234');
    });

    it('입력 중 점진적으로 포맷팅한다', () => {
      expect(formatPhoneNumber('1588')).toBe('1588');
      expect(formatPhoneNumber('15881')).toBe('1588-1');
    });
  });

  describe('공통', () => {
    it('빈 문자열은 빈 문자열을 반환한다', () => {
      expect(formatPhoneNumber('')).toBe('');
    });

    it('문자가 섞인 입력에서 숫자만 추출한다', () => {
      expect(formatPhoneNumber('abc010def1234ghi5678')).toBe('010-1234-5678');
    });
  });
});

describe('isValidKoreanPhone', () => {
  describe('유효한 번호', () => {
    it.each([
      ['010-1234-5678', '휴대폰 010'],
      ['011-1234-5678', '휴대폰 011'],
      ['016-1234-5678', '휴대폰 016'],
      ['019-1234-5678', '휴대폰 019'],
      ['02-755-9857', '서울 9자리'],
      ['02-1234-5678', '서울 10자리'],
      ['031-123-4567', '지역번호 10자리'],
      ['031-1234-5678', '지역번호 11자리'],
      ['070-1234-5678', '인터넷전화'],
      ['1588-1234', '대표번호 1588'],
      ['1544-5678', '대표번호 1544'],
      ['1599-0000', '대표번호 1599'],
    ])('%s (%s) 통과한다', (phone) => {
      expect(isValidKoreanPhone(phone)).toBe(true);
    });
  });

  describe('유효하지 않은 번호', () => {
    it.each([
      ['abc', '문자열'],
      ['123456', '패턴 불일치'],
      ['020-1234-5678', '잘못된 접두사'],
      ['010-1234', '자릿수 부족'],
      ['1234-5678', '잘못된 대표번호 접두사'],
    ])('%s (%s) 실패한다', (phone) => {
      expect(isValidKoreanPhone(phone)).toBe(false);
    });
  });
});
