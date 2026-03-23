import { z } from 'zod';

import { isValidKoreanPhone } from '../_utils/formatPhoneNumber';

export const missionaryRegionSchema = z.object({
  missionGroupId: z.string().min(1, '선교 그룹을 선택해주세요'),
  name: z.string().min(1, '연계지 이름을 입력해주세요'),
  pastorName: z.string().optional(),
  pastorPhone: z
    .string()
    .refine(
      (val) => !val || isValidKoreanPhone(val),
      '올바른 전화번호를 입력해주세요 (예: 010-1234-1234)',
    )
    .transform((val) => val || undefined)
    .optional(),
  addressBasic: z.string().optional(),
  addressDetail: z.string().optional(),
  note: z.string().optional(),
});

export type MissionaryRegionFormValues = z.infer<typeof missionaryRegionSchema>;
