import { missionGroupSchema } from './missionGroupSchema';

describe('missionGroupSchema', () => {
  it('유효한 데이터를 통과시킨다', () => {
    const result = missionGroupSchema.safeParse({
      name: '2024 여름 선교',
      category: 'DOMESTIC',
    });

    expect(result.success).toBe(true);
  });

  it('설명이 포함된 데이터를 통과시킨다', () => {
    const result = missionGroupSchema.safeParse({
      name: '2024 여름 선교',
      category: 'ABROAD',
      description: '해외 단기선교',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('해외 단기선교');
    }
  });

  it('빈 그룹명을 거부한다', () => {
    const result = missionGroupSchema.safeParse({
      name: '',
      category: 'DOMESTIC',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('선교 그룹명을 입력해주세요');
    }
  });

  it('카테고리가 없으면 거부한다', () => {
    const result = missionGroupSchema.safeParse({
      name: '2024 여름 선교',
    });

    expect(result.success).toBe(false);
  });

  it('잘못된 카테고리를 거부한다', () => {
    const result = missionGroupSchema.safeParse({
      name: '2024 여름 선교',
      category: 'INVALID',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('선교 유형을 선택해주세요');
    }
  });
});
