import { isValidKoreanPhone } from 'lib/utils/formatPhoneNumber';
import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isNotFutureDate(value: string): boolean {
  return new Date(value) <= new Date();
}

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(1, '이름을 입력해주세요'),
    phoneNumber: z
      .string()
      .optional()
      .refine((v) => !v || isValidKoreanPhone(v), {
        message: '올바른 전화번호 형식이 아닙니다',
      }),
    birthDate: z
      .string()
      .optional()
      .refine((v) => !v || DATE_REGEX.test(v), {
        message: '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)',
      })
      .refine((v) => !v || isNotFutureDate(v), {
        message: '미래 날짜는 입력할 수 없습니다',
      }),
    gender: z.enum(['MALE', 'FEMALE']).optional(),
    isBaptized: z.boolean(),
    baptizedAt: z
      .string()
      .optional()
      .refine((v) => !v || DATE_REGEX.test(v), {
        message: '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)',
      })
      .refine((v) => !v || isNotFutureDate(v), {
        message: '미래 날짜는 입력할 수 없습니다',
      }),
    role: z.enum(['USER', 'STAFF', 'ADMIN']),
  })
  .transform((data) => ({
    ...data,
    baptizedAt: data.isBaptized ? data.baptizedAt : undefined,
  }))
  .refine(
    (data) => {
      if (!data.baptizedAt || !data.birthDate) return true;
      return new Date(data.baptizedAt) >= new Date(data.birthDate);
    },
    {
      message: '세례일은 생년월일 이후여야 합니다',
      path: ['baptizedAt'],
    },
  );

export type UserUpdateFormValues = z.input<typeof userUpdateSchema>;
