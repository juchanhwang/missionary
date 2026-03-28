import { z } from 'zod';

export const participantSchema = z.object({
  affiliation: z.string().optional(),
  attendanceOptionId: z.string().min(1, '참석 일정을 선택해주세요'),
  cohort: z.number().int().min(1, '기수를 입력해주세요'),
  hasPastParticipation: z.boolean().optional(),
  isCollegeStudent: z.boolean().optional(),
  answers: z.array(
    z.object({
      formFieldId: z.string(),
      value: z.string(),
    }),
  ),
});

export type ParticipantFormValues = z.infer<typeof participantSchema>;
