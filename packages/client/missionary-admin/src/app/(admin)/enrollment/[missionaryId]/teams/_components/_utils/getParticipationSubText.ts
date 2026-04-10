import type { Participation } from 'apis/participation';

/**
 * 참가자 카드 서브텍스트 ("{cohort}기 · {affiliation}") 생성.
 *
 * ui-spec §4-4: "둘 다 없으면 서브텍스트 영역 숨김" 정책.
 * - 둘 다 없음 → `null` 반환 (호출부에서 서브 영역 자체를 렌더하지 않음)
 * - 하나만 있음 → 있는 쪽만 표시
 * - 둘 다 있음 → "{cohort}기 · {affiliation}"
 *
 * 참고: `cohort === 0`은 유효한 기수가 아니라고 가정 (BE 도메인 규칙상 1기부터 시작).
 * affiliation은 빈 문자열일 수 있으므로 trim 후 비교.
 */
export function getParticipationSubText(
  participation: Pick<Participation, 'cohort' | 'affiliation'>,
): string | null {
  const cohortLabel =
    participation.cohort > 0 ? `${participation.cohort}기` : null;
  const affiliationLabel =
    participation.affiliation.trim().length > 0
      ? participation.affiliation.trim()
      : null;

  if (cohortLabel === null && affiliationLabel === null) {
    return null;
  }
  if (cohortLabel !== null && affiliationLabel !== null) {
    return `${cohortLabel} · ${affiliationLabel}`;
  }
  return cohortLabel ?? affiliationLabel;
}
