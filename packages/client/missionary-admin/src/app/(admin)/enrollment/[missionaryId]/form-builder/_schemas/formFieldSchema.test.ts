import { formFieldSchema } from './formFieldSchema';

describe('formFieldSchema', () => {
  const validData = {
    fieldType: 'TEXT' as const,
    label: '교회명',
    isRequired: false,
  };

  it('유효한 데이터를 통과시킨다', () => {
    const result = formFieldSchema.safeParse(validData);

    expect(result.success).toBe(true);
  });

  it.each(['TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'SELECT', 'DATE'] as const)(
    'fieldType "%s"를 유효하게 처리한다',
    (fieldType) => {
      const result = formFieldSchema.safeParse({ ...validData, fieldType });

      expect(result.success).toBe(true);
    },
  );

  it('유효하지 않은 fieldType을 거부한다', () => {
    const result = formFieldSchema.safeParse({
      ...validData,
      fieldType: 'UNKNOWN',
    });

    expect(result.success).toBe(false);
  });

  it('빈 라벨을 거부하고 에러 메시지를 반환한다', () => {
    const result = formFieldSchema.safeParse({
      ...validData,
      label: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('라벨을 입력해주세요');
    }
  });

  it('placeholder가 없어도 유효하다 (선택 필드)', () => {
    const result = formFieldSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.placeholder).toBeUndefined();
    }
  });

  it('options가 문자열 배열이면 유효하다', () => {
    const result = formFieldSchema.safeParse({
      ...validData,
      fieldType: 'SELECT',
      options: ['옵션1', '옵션2'],
    });

    expect(result.success).toBe(true);
  });

  it('options가 없어도 유효하다 (선택 필드)', () => {
    const result = formFieldSchema.safeParse({
      ...validData,
      fieldType: 'SELECT',
    });

    expect(result.success).toBe(true);
  });
});
