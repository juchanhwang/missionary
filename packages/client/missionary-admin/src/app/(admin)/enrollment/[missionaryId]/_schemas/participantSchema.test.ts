import { participantSchema } from './participantSchema';

describe('participantSchema', () => {
  const validData = {
    affiliation: '서울교회',
    attendanceOptionId: 'att-opt-1',
    cohort: 1,
    hasPastParticipation: false,
    isCollegeStudent: false,
    answers: [{ formFieldId: 'field-1', value: '답변' }],
  };

  it('유효한 데이터를 통과시킨다', () => {
    const result = participantSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it('attendanceOptionId가 빈 문자열이면 에러를 반환한다', () => {
    const result = participantSchema.safeParse({
      ...validData,
      attendanceOptionId: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.find(
          (issue) => issue.path[0] === 'attendanceOptionId',
        )?.message,
      ).toBe('참석 일정을 선택해주세요');
    }
  });

  it('cohort가 0이면 에러를 반환한다', () => {
    const result = participantSchema.safeParse({
      ...validData,
      cohort: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.find((issue) => issue.path[0] === 'cohort')
          ?.message,
      ).toBe('기수를 입력해주세요');
    }
  });

  it('cohort가 소수이면 에러를 반환한다', () => {
    const result = participantSchema.safeParse({
      ...validData,
      cohort: 1.5,
    });

    expect(result.success).toBe(false);
  });

  it('affiliation이 없어도 유효하다 (선택 필드)', () => {
    const result = participantSchema.safeParse({
      ...validData,
      affiliation: undefined,
    });

    expect(result.success).toBe(true);
  });

  it('hasPastParticipation이 없어도 유효하다 (선택 필드)', () => {
    const result = participantSchema.safeParse({
      ...validData,
      hasPastParticipation: undefined,
    });

    expect(result.success).toBe(true);
  });

  it('answers가 빈 배열이어도 유효하다', () => {
    const result = participantSchema.safeParse({
      ...validData,
      answers: [],
    });

    expect(result.success).toBe(true);
  });
});
