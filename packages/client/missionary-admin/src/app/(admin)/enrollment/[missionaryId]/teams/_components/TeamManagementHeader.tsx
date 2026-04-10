'use client';

import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

interface TeamManagementHeaderProps {
  mission: EnrollmentMissionSummary;
}

export function TeamManagementHeader({ mission }: TeamManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link
          href={`/enrollment/${mission.id}`}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          {mission.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium">팀 관리</span>
      </div>

      {/* 타이틀 */}
      <div className="flex items-center gap-2.5">
        <h2 className="text-lg font-semibold text-gray-900">
          {mission.name} · 팀 관리
        </h2>
      </div>
    </div>
  );
}
