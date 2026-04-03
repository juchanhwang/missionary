'use client';

import { MissionEnrollmentCard } from './MissionEnrollmentCard';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

interface HighlightCardSectionProps {
  missions: EnrollmentMissionSummary[];
}

export function HighlightCardSection({ missions }: HighlightCardSectionProps) {
  // 모집 중만 필터 → ID 내림차순 (최신 순) → 최대 3개
  const recruitingMissions = missions
    .filter((m) => m.status === 'ENROLLMENT_OPENED')
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 3);

  if (recruitingMissions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          모집 중
        </p>
        <span className="text-sm text-gray-400">
          — 최근 등록된 {recruitingMissions.length}개
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
