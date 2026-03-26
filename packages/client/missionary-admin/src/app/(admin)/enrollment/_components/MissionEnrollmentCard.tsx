'use client';

import Link from 'next/link';

import { ProgressBar } from './ProgressBar';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const target = new Date(deadline);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getColorBarClass(
  summary: EnrollmentMissionSummary,
  daysLeft: number | null,
): string {
  const { maximumParticipantCount, currentParticipantCount } = summary;
  if (
    maximumParticipantCount &&
    currentParticipantCount >= maximumParticipantCount
  ) {
    return 'bg-green-60';
  }
  if (daysLeft !== null && daysLeft <= 3) {
    return 'bg-warning-70';
  }
  return 'bg-blue-60';
}

function getProgressPercent(summary: EnrollmentMissionSummary): number | null {
  if (!summary.maximumParticipantCount) return null;
  return Math.round(
    (summary.currentParticipantCount / summary.maximumParticipantCount) * 100,
  );
}

interface MissionEnrollmentCardProps {
  mission: EnrollmentMissionSummary;
}

export function MissionEnrollmentCard({ mission }: MissionEnrollmentCardProps) {
  const daysLeft = getDaysUntilDeadline(mission.enrollmentDeadline);
  const colorBarClass = getColorBarClass(mission, daysLeft);
  const progressPercent = getProgressPercent(mission);

  return (
    <Link
      href={`/enrollment/${mission.id}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:border-gray-400 hover:shadow-md"
    >
      {/* 상단 컬러 바 */}
      <div className={`h-1 ${colorBarClass}`} />

      <div className="p-4 flex flex-col gap-3">
        {/* 배지 영역 */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              mission.category === 'DOMESTIC'
                ? 'bg-green-10 text-green-60'
                : 'bg-blue-10 text-blue-60'
            }`}
          >
            {mission.category === 'DOMESTIC' ? '국내' : '해외'}
          </span>
          {daysLeft !== null && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                daysLeft <= 3
                  ? 'bg-warning-10 text-warning-70 font-bold'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              D-{daysLeft}
            </span>
          )}
        </div>

        {/* 선교명 */}
        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-50">
          {mission.name}
        </h3>

        {/* 등록자/정원 */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-900">
            {mission.currentParticipantCount}명
          </span>
          {mission.maximumParticipantCount && (
            <span className="text-xs text-gray-400">
              / {mission.maximumParticipantCount}명
            </span>
          )}
        </div>

        {/* 프로그레스 바 */}
        {progressPercent !== null && (
          <ProgressBar
            value={progressPercent}
            className={`h-1.5 ${progressPercent > 100 ? 'bg-warning-70' : 'bg-blue-60'}`}
          />
        )}

        {/* 푸터 */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            납부 {mission.paidCount}/{mission.currentParticipantCount}
          </span>
          {mission.managerName && <span>{mission.managerName}</span>}
        </div>
      </div>
    </Link>
  );
}
