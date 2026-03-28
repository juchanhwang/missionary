'use client';

import { MissionEnrollmentCard } from './MissionEnrollmentCard';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

interface HighlightCardSectionProps {
  missions: EnrollmentMissionSummary[];
}

function getRegistrationRate(m: EnrollmentMissionSummary): number {
  if (!m.maximumParticipantCount) return 0;
  return m.currentParticipantCount / m.maximumParticipantCount;
}

export function HighlightCardSection({ missions }: HighlightCardSectionProps) {
  // 모집 중만 필터 → 마감일 오름차순 → 등록률 오름차순 → 최대 3개
  const recruitingMissions = missions
    .filter((m) => m.status === 'ENROLLMENT_OPENED')
    .sort((a, b) => {
      const deadlineA = a.enrollmentDeadline ?? '';
      const deadlineB = b.enrollmentDeadline ?? '';
      const deadlineDiff = deadlineA.localeCompare(deadlineB);
      if (deadlineDiff !== 0) return deadlineDiff;
      return getRegistrationRate(a) - getRegistrationRate(b);
    })
    .slice(0, 3);

  if (recruitingMissions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          마감 임박
        </p>
        <span className="text-sm text-gray-400">
          — 신청 마감이 가장 가까운 {recruitingMissions.length}개
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recruitingMissions.map((mission) => (
          <MissionEnrollmentCard key={mission.id} mission={mission} />
        ))}
      </div>
    </section>
  );
}
