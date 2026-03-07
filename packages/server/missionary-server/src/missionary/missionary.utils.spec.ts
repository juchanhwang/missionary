import {
  calculateNextOrder,
  generateMissionaryName,
  shouldAutoFillName,
} from './missionary.utils';

describe('MissionaryUtils', () => {
  describe('calculateNextOrder', () => {
    it('현재 최대 order가 있으면 +1을 반환한다', () => {
      expect(calculateNextOrder(3)).toBe(4);
    });

    it('현재 최대 order가 null이면 1을 반환한다', () => {
      expect(calculateNextOrder(null)).toBe(1);
    });

    it('현재 최대 order가 0이면 1을 반환한다', () => {
      expect(calculateNextOrder(0)).toBe(1);
    });
  });

  describe('generateMissionaryName', () => {
    it('order와 그룹 이름으로 선교명을 생성한다', () => {
      expect(generateMissionaryName(3, '필리핀 선교')).toBe('3차 필리핀 선교');
    });

    it('order가 1이면 1차 prefix로 생성한다', () => {
      expect(generateMissionaryName(1, '단기 선교')).toBe('1차 단기 선교');
    });
  });

  describe('shouldAutoFillName', () => {
    it('name이 undefined이면 true를 반환한다', () => {
      expect(shouldAutoFillName(undefined)).toBe(true);
    });

    it('name이 null이면 true를 반환한다', () => {
      expect(shouldAutoFillName(null)).toBe(true);
    });

    it('name이 빈 문자열이면 true를 반환한다', () => {
      expect(shouldAutoFillName('')).toBe(true);
    });

    it('name이 공백만 있으면 true를 반환한다', () => {
      expect(shouldAutoFillName('   ')).toBe(true);
    });

    it('name이 유효한 문자열이면 false를 반환한다', () => {
      expect(shouldAutoFillName('2차 선교')).toBe(false);
    });
  });
});
