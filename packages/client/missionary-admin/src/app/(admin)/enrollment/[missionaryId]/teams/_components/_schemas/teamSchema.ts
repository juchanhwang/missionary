import { z } from 'zod';

/**
 * 팀 생성/수정 폼 스키마. fe-plan v1.2 §7-1 CreateTeamPayload 참조.
 *
 * - `teamName`: 필수, 최소 1자
 * - `leaderUserId`: 필수 (참가자 중 선택, participation.userId)
 * - `missionaryRegionId`: 선택 (빈 문자열 = 미지정)
 *
 * `leaderUserName`은 submit 시점에 `participations`에서 lookup하여 채운다.
 * (스키마에 포함하지 않는 이유: 사용자 입력이 아닌 derive 값이므로)
 */
export const teamSchema = z.object({
  teamName: z.string().trim().min(1, '팀 이름을 입력해주세요'),
  leaderUserId: z.string().min(1, '팀장을 선택해주세요'),
  missionaryRegionId: z.string().optional(),
});

export type TeamFormValues = z.infer<typeof teamSchema>;
