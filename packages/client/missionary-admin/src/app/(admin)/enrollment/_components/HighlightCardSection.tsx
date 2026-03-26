'use client';

import { MissionEnrollmentCard } from './MissionEnrollmentCard';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

interface HighlightCardSectionProps {
  missions: EnrollmentMissionSummary[];
}

export function HighlightCardSection({ missions }: HighlightCardSectionProps) {
  const recruitingMissions = missions
    .filter((m) => m.status === 'ENROLLMENT_OPENED')
    .slice(0, 3);

  if (recruitingMissions.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        모집 중인 선교
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recruitingMissions.map((mission) => (
          <MissionEnrollmentCard key={mission.id} mission={mission} />
        ))}
      </div>
    </section>
  );
}
