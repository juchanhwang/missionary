import { z } from 'zod';

const optionalNumber = z
  .any()
  .optional()
  .transform((val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    const n = Number(val);
    return isNaN(n) ? undefined : n;
  })
  .pipe(z.number().optional());

export const missionSchema = z.object({
  name: z.string().min(1, '선교 이름을 입력해주세요'),
  startDate: z.date({ message: '선교 시작일을 선택해주세요' }),
  endDate: z.date({ message: '선교 종료일을 선택해주세요' }),
  pastorName: z.string().min(1, '담당 교역자를 입력해주세요'),
  pastorPhone: z.string().optional(),
  participationStartDate: z
    .date({ message: '참가 신청 시작일을 선택해주세요' })
    .optional(),
  participationEndDate: z
    .date({ message: '참가 신청 종료일을 선택해주세요' })
    .optional(),
  price: optionalNumber,
  description: z.string().optional(),
  maximumParticipantCount: optionalNumber,
  bankName: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  status: z
    .enum([
      'ENROLLMENT_OPENED',
      'ENROLLMENT_CLOSED',
      'IN_PROGRESS',
      'COMPLETED',
    ])
    .optional(),
  order: optionalNumber,
});

export type MissionFormData = z.infer<typeof missionSchema>;
