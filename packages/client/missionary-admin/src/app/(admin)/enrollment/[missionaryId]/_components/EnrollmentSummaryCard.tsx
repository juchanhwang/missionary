'use client';

import { SummaryStatItem } from './SummaryStatItem';
import { ProgressBar } from '../../_components/ProgressBar';

import type { PaginatedParticipationsResponse } from 'apis/participation';

interface EnrollmentSummaryCardProps {
  participations: PaginatedParticipationsResponse;
  maximumParticipantCount: number | null;
}

export function EnrollmentSummaryCard({
  participations,
  maximumParticipantCount,
}: EnrollmentSummaryCardProps) {
  const total = participations.total;
  const paidCount = participations.data.filter((p) => p.isPaid).length;
  const unpaidCount = participations.data.filter((p) => !p.isPaid).length;
  const fullCount = participations.data.filter(
    (p) => p.attendanceOption?.type === 'FULL',
  ).length;
  const partialCount = participations.data.filter(
    (p) => p.attendanceOption?.type === 'PARTIAL',
  ).length;

  const progressPercent = maximumParticipantCount
    ? Math.round((total / maximumParticipantCount) * 100)
    : null;

  const isOverCapacity =
    maximumParticipantCount !== null && total > maximumParticipantCount;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-3 gap-6">
        {/* 총 등록자/정원 */}
        <div className="flex flex-col gap-3">
          <SummaryStatItem
            label="총 등록자"
            value={`${total}명`}
            subValue={
              maximumParticipantCount
                ? `정원 ${maximumParticipantCount}명`
                : undefined
            }
            valueClassName={isOverCapacity ? 'text-warning-70' : ''}
          />
          {progressPercent !== null && (
            <ProgressBar
              value={progressPercent}
              className={`h-2 ${isOverCapacity ? 'bg-warning-70' : 'bg-gray-800'}`}
            />
          )}
        </div>

        {/* 납부 현황 */}
        <SummaryStatItem
          label="납부완료"
          value={`${paidCount}명`}
          subValue={`미납 ${unpaidCount}명`}
        />

        {/* 참석 유형 */}
        <SummaryStatItem
          label="풀참석"
          value={`${fullCount}명`}
          subValue={`옵션참여 ${partialCount}명`}
        />
      </div>
    </div>
  );
}
