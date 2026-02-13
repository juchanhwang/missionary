import { describe, it, expect } from 'vitest';

import { changePasswordSchema } from '../changePasswordSchema';

describe('changePasswordSchema', () => {
  it('유효한 데이터를 통과시킨다', () => {
    const validData = {
      currentPassword: 'oldPassword1',
      newPassword: 'newPassword1',
      newPasswordConfirm: 'newPassword1',
    };
    const result = changePasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('빈 현재 비밀번호를 거부한다', () => {
    const invalidData = {
      currentPassword: '',
      newPassword: 'newPassword1',
      newPasswordConfirm: 'newPassword1',
    };
    const result = changePasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        '현재 비밀번호를 입력해주세요',
      );
    }
  });

  it('8자 미만 새 비밀번호를 거부한다', () => {
    const invalidData = {
      currentPassword: 'oldPassword1',
      newPassword: 'short',
      newPasswordConfirm: 'short',
    };
    const result = changePasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwError = result.error.issues.find(
        (i) => i.path[0] === 'newPassword',
      );
      expect(pwError?.message).toBe('비밀번호는 8자 이상이어야 합니다');
    }
  });

  it('새 비밀번호 불일치를 거부한다', () => {
    const invalidData = {
      currentPassword: 'oldPassword1',
      newPassword: 'newPassword1',
      newPasswordConfirm: 'different123',
    };
    const result = changePasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path[0] === 'newPasswordConfirm',
      );
      expect(confirmError?.message).toBe('새 비밀번호가 일치하지 않습니다');
    }
  });

  it('빈 새 비밀번호 확인을 거부한다', () => {
    const invalidData = {
      currentPassword: 'oldPassword1',
      newPassword: 'newPassword1',
      newPasswordConfirm: '',
    };
    const result = changePasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
