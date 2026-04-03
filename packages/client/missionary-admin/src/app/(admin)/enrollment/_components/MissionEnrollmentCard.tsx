'use client';

import { Badge } from '@samilhero/design-system';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

import { ProgressBar } from './ProgressBar';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const target = new Date(deadline);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function formatMissionPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sy = s.getFullYear();
  const sm = String(s.getMonth() + 1).padStart(2, '0');
  const sd = String(s.getDate()).padStart(2, '0');
  const em = String(e.getMonth() + 1).padStart(2, '0');
  const ed = String(e.getDate()).padStart(2, '0');

  if (s.getFullYear() === e.getFullYear()) {
    return `${sy}.${sm}.${sd} ~ ${em}.${ed}`;
  }
  return `${sy}.${sm}.${sd} ~ ${e.getFullYear()}.${em}.${ed}`;
}

function getColorBarClass(daysLeft: number | null): string {
  if (daysLeft !== null && daysLeft < 0) return 'bg-red-600';
  if (daysLeft !== null && daysLeft <= 7) return 'bg-warning-60';
  return 'bg-blue-60';
}

function getProgressPercent(mission: EnrollmentMissionSummary): number | null {
  if (!mission.maximumParticipantCount) return null;
  return Math.round(
    (mission.currentParticipantCount / mission.maximumParticipantCount) * 100,
  );
}

interface MissionEnrollmentCardProps {
  mission: EnrollmentMissionSummary;
}

export function MissionEnrollmentCard({ mission }: MissionEnrollmentCardProps) {
  const daysLeft = getDaysUntilDeadline(mission.enrollmentDeadline);
  const colorBarClass = getColorBarClass(daysLeft);
  const progressPercent = getProgressPercent(mission);
  const unpaidCount = mission.currentParticipantCount - mission.paidCount;

  return (
    <Link
      href={`/enrollment/${mission.id}`}
      className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-400 hover:shadow-md transition-all overflow-clip"
    >
      {/* 상단 컬러 바 */}
      <div className={`h-1 ${colorBarClass}`} />

      <div className="p-5">
        {/* 카테고리 Badge + D-day Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline">
            {mission.category === 'DOMESTIC' ? '국내' : '해외'}
          </Badge>
          {daysLeft !== null && (
            <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-500">
              {daysLeft < 0 ? '모집 종료' : `D-${daysLeft}`}
            </span>
          )}
        </div>

        {/* 선교명 + 부제 */}
        <h3 className="text-base font-bold text-gray-900 transition-colors mb-4">
          {mission.name}
        </h3>

        {/* 선교 기간 */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <Calendar size={12} className="shrink-0" />
          <span>
            선교{' '}
            {formatMissionPeriod(
              mission.missionStartDate,
              mission.missionEndDate,
            )}
          </span>
        </div>

        {/* 등록 마감 */}
        {mission.enrollmentDeadline && (
          <div className="flex items-center gap-1.5 text-xs mb-4">
            <Clock size={12} className="shrink-0 text-gray-400" />
            <span className="text-gray-500">
              등록 마감 {formatDate(mission.enrollmentDeadline)}
            </span>
          </div>
        )}
        {!mission.enrollmentDeadline && <div className="mb-4" />}

        {/* 등록 현황 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">등록 현황</span>
            <span className="text-gray-900 font-bold">
              {mission.currentParticipantCount}
              {mission.maximumParticipantCount && (
                <span className="text-gray-400 font-normal">
                  {' '}
                  / {mission.maximumParticipantCount}명
                </span>
              )}
              {!mission.maximumParticipantCount && (
                <span className="text-gray-400 font-normal">명</span>
              )}
            </span>
          </div>

          {progressPercent !== null ? (
            <ProgressBar
              value={progressPercent}
              className={`h-1.5 ${
                progressPercent > 100 ? 'text-warning-60' : 'text-blue-60'
              }`}
            />
          ) : (
            <div className="h-1.5 rounded-full bg-gray-100" />
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              납부완료 {mission.paidCount} · 미납 {unpaidCount}
            </span>
            {progressPercent !== null && <span>{progressPercent}%</span>}
          </div>
        </div>
      </div>

      {/* 하단 푸터 */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <span className="text-xs text-gray-400">
          {mission.managerName ? `담당: ${mission.managerName}` : '\u00A0'}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
          관리하기
          <ChevronRight size={12} />
        </span>
      </div>
    </Link>
  );
}
