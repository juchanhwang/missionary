'use client';

import { Badge, Button } from '@samilhero/design-system';
import { ArrowLeft, ChevronRight, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { MISSION_STATUS_LABEL } from '../../../../missions/_utils/missionStatus';

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

interface FormBuilderToolbarProps {
  mission: EnrollmentMissionSummary;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onPreview: () => void;
}

export function FormBuilderToolbar({
  mission,
  isDirty,
  isSaving,
  onSave,
  onPreview,
}: FormBuilderToolbarProps) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-gray-100/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex flex-col gap-1">
        {/* 브레드크럼 */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link href="/enrollment" className="hover:text-gray-700">
            등록 관리
          </Link>
          <ChevronRight size={14} />
          <Link
            href={`/enrollment/${mission.id}`}
            className="hover:text-gray-700"
          >
            {mission.name}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">신청 폼 관리</span>
        </div>
        {/* 제목 */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/enrollment/${mission.id}`}
            className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200"
            aria-label="등록 상세로 돌아가기"
          >
            <ArrowLeft size={16} />
          </Link>
          <h2 className="text-lg font-semibold text-gray-900">신청 폼 관리</h2>
          <Badge variant="outline">{mission.name}</Badge>
          <Badge variant={STATUS_VARIANTS[mission.status] ?? 'outline'}>
            {MISSION_STATUS_LABEL[mission.status] ?? mission.status}
          </Badge>
        </div>
      </div>
      {/* 액션 영역 */}
      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="text-xs text-gray-400">미저장 변경사항 있음</span>
        )}
        <Button variant="outline" color="neutral" size="sm" onClick={onPreview}>
          <Eye size={14} />
          미리보기
        </Button>
        <Button
          variant="filled"
          color="neutral"
          size="sm"
          onClick={onSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          저장
        </Button>
      </div>
    </div>
  );
}
