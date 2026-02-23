import { z } from 'zod';

export const missionGroupSchema = z.object({
  name: z.string().min(1, '선교 그룹명을 입력해주세요'),
  description: z.string().optional(),
  category: z.enum(['DOMESTIC', 'ABROAD'], { message: '선교 유형을 선택해주세요' }),
});

export type MissionGroupSchemaType = z.infer<typeof missionGroupSchema>;
