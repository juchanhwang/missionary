import { missionaryRegionSchema } from './missionaryRegionSchema';

describe('missionaryRegionSchema', () => {
  const validInput = {
    missionGroupId: 'group-1',
    name: '서울교회',
  };

  it('필수 필드만 입력하면 검증을 통과한다', () => {
    const result = missionaryRegionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('missionGroupId가 빈 문자열이면 검증에 실패한다', () => {
    const result = missionaryRegionSchema.safeParse({
      ...validInput,
      missionGroupId: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('선교 그룹을 선택해주세요');
    }
  });

  it('name이 빈 문자열이면 검증에 실패한다', () => {
    const result = missionaryRegionSchema.safeParse({
      ...validInput,
      name: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('연계지 이름을 입력해주세요');
    }
  });

  describe('pastorPhone 검증', () => {
    it.each([
      ['010-1234-5678', '휴대폰'],
      ['02-755-9857', '서울 지역번호'],
      ['031-123-4567', '경기 지역번호'],
      ['1588-1234', '대표번호'],
      ['070-1234-5678', '인터넷전화'],
    ])('%s (%s) 유효한 번호를 통과한다', (phone) => {
      const result = missionaryRegionSchema.safeParse({
        ...validInput,
        pastorPhone: phone,
      });
      expect(result.success).toBe(true);
    });

    it.each([
      ['abc', '문자열'],
      ['123456', '패턴 불일치'],
      ['020-1234-5678', '잘못된 접두사'],
      ['010-1234', '자릿수 부족'],
    ])('%s (%s) 유효하지 않은 번호는 실패한다', (phone) => {
      const result = missionaryRegionSchema.safeParse({
        ...validInput,
        pastorPhone: phone,
      });
      expect(result.success).toBe(false);
    });

    it('빈 문자열은 undefined로 변환된다', () => {
      const result = missionaryRegionSchema.safeParse({
        ...validInput,
        pastorPhone: '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pastorPhone).toBeUndefined();
      }
    });

    it('미입력 시 검증을 통과한다', () => {
      const result = missionaryRegionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pastorPhone).toBeUndefined();
      }
    });
  });
});
