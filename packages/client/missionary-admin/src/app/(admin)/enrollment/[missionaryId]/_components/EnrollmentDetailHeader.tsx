'use client';

import { Badge } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';
import { ArrowLeft, ChevronRight, Table2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { MISSION_STATUS_LABEL } from '../../../missions/_utils/missionStatus';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

const STATUS_VARIANTS: Record<
  string,
  'success' | 'destructive' | 'info' | 'outline'
> = {
  ENROLLMENT_OPENED: 'info',
  ENROLLMENT_CLOSED: 'destructive',
  IN_PROGRESS: 'success',
  COMPLETED: 'outline',
};

interface EnrollmentDetailHeaderProps {
  mission: EnrollmentMissionSummary;
}

function formatPeriod(start: string, end: string): string {
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

export function EnrollmentDetailHeader({
  mission,
}: EnrollmentDetailHeaderProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const { missionaryId } = useParams<{ missionaryId: string }>();

  const subtitleParts = [
    mission.missionGroupName,
    formatPeriod(mission.missionStartDate, mission.missionEndDate),
    mission.managerName ? `담당: ${mission.managerName}` : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-1.5">
      {/* 브레드크럼 + 등록 폼 관리 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link
            href="/enrollment"
            className="flex items-center gap-1 hover:text-gray-700"
          >
            <ArrowLeft size={14} />
            등록 관리
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">{mission.name}</span>
        </div>
        {isAdmin && (
          <Link
            href={`/enrollment/${missionaryId}/form-builder`}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <Table2 size={14} />
            등록 폼 관리
          </Link>
        )}
      </div>

      {/* 타이틀 + 뱃지 */}
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-semibold text-gray-900">{mission.name}</h2>
        <Badge variant="outline">
          {mission.category === 'DOMESTIC' ? '국내' : '해외'}
        </Badge>
        <Badge variant={STATUS_VARIANTS[mission.status] ?? 'outline'}>
          {MISSION_STATUS_LABEL[mission.status] ?? mission.status}
        </Badge>
      </div>

      {/* 부제 */}
      {subtitleParts.length > 0 && (
        <p className="text-sm text-gray-400">{subtitleParts.join(' · ')}</p>
      )}
    </div>
  );
}
