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
    it('유효한 전화번호 형식을 통과한다', () => {
      const result = missionaryRegionSchema.safeParse({
        ...validInput,
        pastorPhone: '010-1234-5678',
      });
      expect(result.success).toBe(true);
    });

    it('숫자와 하이픈이 아닌 문자가 포함되면 실패한다', () => {
      const result = missionaryRegionSchema.safeParse({
        ...validInput,
        pastorPhone: 'abc',
      });
      expect(result.success).toBe(false);
    });

    it('7자 미만이면 실패한다', () => {
      const result = missionaryRegionSchema.safeParse({
        ...validInput,
        pastorPhone: '123456',
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
