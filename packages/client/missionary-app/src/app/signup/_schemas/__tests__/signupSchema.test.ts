import { describe, it, expect } from 'vitest';

import { signupSchema } from '../signupSchema';

describe('signupSchema', () => {
  it('유효한 데이터를 통과시킨다', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      name: '홍길동',
    };
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('이름 없이도 통과시킨다', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    };
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('빈 이메일을 거부한다', () => {
    const invalidData = {
      email: '',
      password: 'password123',
      passwordConfirm: 'password123',
    };
    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('이메일을 입력해주세요');
    }
  });

  it('잘못된 이메일 형식을 거부한다', () => {
    const invalidData = {
      email: 'invalid',
      password: 'password123',
      passwordConfirm: 'password123',
    };
    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        '올바른 이메일 형식이 아닙니다',
      );
    }
  });

  it('8자 미만 비밀번호를 거부한다', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
      passwordConfirm: 'short',
    };
    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find((i) => i.path[0] === 'password');
      expect(pwError?.message).toBe('비밀번호는 8자 이상이어야 합니다');
    }
  });

  it('비밀번호 불일치를 거부한다', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'different123',
    };
    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path[0] === 'passwordConfirm',
      );
      expect(confirmError?.message).toBe('비밀번호가 일치하지 않습니다');
    }
  });
});
