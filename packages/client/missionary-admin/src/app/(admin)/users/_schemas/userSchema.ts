import { z } from 'zod';

export const userUpdateSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  isBaptized: z.boolean(),
  baptizedAt: z.string().optional(),
  role: z.enum(['USER', 'STAFF', 'ADMIN']),
});

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
