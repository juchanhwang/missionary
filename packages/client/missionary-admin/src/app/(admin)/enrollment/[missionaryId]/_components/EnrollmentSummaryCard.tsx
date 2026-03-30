'use client';

import { AlertCircle, Check, Users } from 'lucide-react';

import { ProgressBar } from '../../_components/ProgressBar';
import { useGetMissionEnrollmentSummary } from '../_hooks/useGetMissionEnrollmentSummary';

import type { MissionEnrollmentSummary } from 'apis/enrollment';

interface EnrollmentSummaryCardProps {
  missionaryId: string;
  initialData: MissionEnrollmentSummary;
}

export function EnrollmentSummaryCard({
  missionaryId,
  initialData,
}: EnrollmentSummaryCardProps) {
  const { data: summary } = useGetMissionEnrollmentSummary({
    missionaryId,
    initialData,
  });

  if (!summary) return null;

  const { totalParticipants, maxParticipants, paidCount, unpaidCount } =
    summary;

  const capacityPercent = maxParticipants
    ? Math.round((totalParticipants / maxParticipants) * 100)
    : null;

  const paidPercent =
    totalParticipants > 0
      ? Math.round((paidCount / totalParticipants) * 100)
      : 0;

  const unpaidPercent =
    totalParticipants > 0
      ? Math.round((unpaidCount / totalParticipants) * 100)
      : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* 총 신청 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">총 신청</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalParticipants}
              <span className="text-base font-medium text-gray-400 ml-1">
                명
              </span>
            </p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-500">
            <Users size={18} />
          </div>
        </div>
        {maxParticipants !== null && capacityPercent !== null && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>정원 대비</span>
              <span>
                {totalParticipants} / {maxParticipants}명 ({capacityPercent}%)
              </span>
            </div>
            <ProgressBar
              value={capacityPercent}
              className="h-1.5 text-gray-800"
            />
          </div>
        )}
      </div>

      {/* 납부완료 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">납부완료</p>
            <p className="text-2xl font-bold text-green-60">
              {paidCount}
              <span className="text-base font-medium text-gray-400 ml-1">
                명
              </span>
            </p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-10">
            <Check size={18} className="text-green-60" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>납부율</span>
            <span>
              {paidCount} / {totalParticipants}명 ({paidPercent}%)
            </span>
          </div>
          <ProgressBar value={paidPercent} className="h-1.5 text-green-60" />
        </div>
      </div>

      {/* 미납 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">미납</p>
            <p className="text-2xl font-bold text-warning-70">
              {unpaidCount}
              <span className="text-base font-medium text-gray-400 ml-1">
                명
              </span>
            </p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-warning-10">
            <AlertCircle size={18} className="text-warning-70" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>미납률</span>
            <span>
              {unpaidCount} / {totalParticipants}명 ({unpaidPercent}%)
            </span>
          </div>
          <ProgressBar
            value={unpaidPercent}
            className="h-1.5 text-warning-70"
          />
        </div>
      </div>
    </div>
  );
}
