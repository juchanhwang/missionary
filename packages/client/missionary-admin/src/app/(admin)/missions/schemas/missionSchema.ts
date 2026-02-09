import { z } from 'zod';

export const missionSchema = z.object({
  name: z.string().min(1, '선교 이름을 입력해주세요'),
  startDate: z.date({ message: '선교 시작일을 선택해주세요' }),
  endDate: z.date({ message: '선교 종료일을 선택해주세요' }),
  pastorName: z.string().min(1, '담당 교역자를 입력해주세요'),
  regionId: z.string().min(1, '지역을 선택해주세요'),
  participationStartDate: z.date({
    message: '참가 신청 시작일을 선택해주세요',
  }),
  participationEndDate: z.date({
    message: '참가 신청 종료일을 선택해주세요',
  }),
});

export type MissionFormData = z.infer<typeof missionSchema>;
