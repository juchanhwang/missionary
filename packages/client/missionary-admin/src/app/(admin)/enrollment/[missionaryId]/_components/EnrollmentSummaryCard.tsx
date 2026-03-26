'use client';

import { SummaryStatItem } from './SummaryStatItem';
import { ProgressBar } from '../../_components/ProgressBar';

import type { MissionEnrollmentSummary } from 'apis/enrollment';

interface EnrollmentSummaryCardProps {
  summary: MissionEnrollmentSummary;
}

export function EnrollmentSummaryCard({ summary }: EnrollmentSummaryCardProps) {
  const {
    totalParticipants,
    maxParticipants,
    paidCount,
    unpaidCount,
    fullAttendanceCount,
    partialAttendanceCount,
  } = summary;

  const progressPercent = maxParticipants
    ? Math.round((totalParticipants / maxParticipants) * 100)
    : null;

  const isOverCapacity =
    maxParticipants !== null && totalParticipants > maxParticipants;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-3 gap-6">
        {/* 총 등록자/정원 */}
        <div className="flex flex-col gap-3">
          <SummaryStatItem
            label="총 등록자"
            value={`${totalParticipants}명`}
            subValue={maxParticipants ? `정원 ${maxParticipants}명` : undefined}
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
          value={`${fullAttendanceCount}명`}
          subValue={`옵션참여 ${partialAttendanceCount}명`}
        />
      </div>
    </div>
  );
}
