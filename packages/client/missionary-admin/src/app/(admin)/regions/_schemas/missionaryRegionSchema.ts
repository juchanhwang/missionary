import { z } from 'zod';

export const missionaryRegionSchema = z.object({
  missionGroupId: z.string().min(1, '선교 그룹을 선택해주세요'),
  name: z.string().min(1, '연계지 이름을 입력해주세요'),
  pastorName: z.string().optional(),
  pastorPhone: z
    .string()
    .refine(
      (val) => !val || /^[\d-]{7,15}$/.test(val),
      '전화번호 형식이 올바르지 않습니다 (숫자, 하이픈 7~15자)',
    )
    .transform((val) => val || undefined)
    .optional(),
  addressBasic: z.string().optional(),
  addressDetail: z.string().optional(),
  note: z.string().optional(),
});

export type MissionaryRegionFormValues = z.infer<typeof missionaryRegionSchema>;
