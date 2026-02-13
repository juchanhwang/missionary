import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: z
      .string()
      .min(1, '새 비밀번호를 입력해주세요')
      .min(8, '비밀번호는 8자 이상이어야 합니다'),
    newPasswordConfirm: z.string().min(1, '새 비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: '새 비밀번호가 일치하지 않습니다',
    path: ['newPasswordConfirm'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
