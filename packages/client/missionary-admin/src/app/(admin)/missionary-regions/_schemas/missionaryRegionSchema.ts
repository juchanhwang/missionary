import { z } from 'zod';

export const missionaryRegionSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  visitPurpose: z.string(),
  pastorName: z.string(),
  pastorPhone: z.string(),
  addressBasic: z.string(),
  addressDetail: z.string(),
});

export type MissionaryRegionFormValues = z.infer<typeof missionaryRegionSchema>;
