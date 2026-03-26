'use client';

import { Badge } from '@samilhero/design-system';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { EnrollmentStatus } from 'apis/enrollment';

const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  ENROLLMENT_PREPARING: '준비 중',
  ENROLLMENT_OPENED: '모집 중',
  ENROLLMENT_CLOSED: '모집 마감',
  COMPLETED: '종료',
};

const STATUS_VARIANTS: Record<
  EnrollmentStatus,
  'success' | 'warning' | 'default' | 'info'
> = {
  ENROLLMENT_PREPARING: 'info',
  ENROLLMENT_OPENED: 'success',
  ENROLLMENT_CLOSED: 'warning',
  COMPLETED: 'default',
};

interface EnrollmentDetailHeaderProps {
  missionName: string;
  status: EnrollmentStatus;
}

export function EnrollmentDetailHeader({
  missionName,
  status,
}: EnrollmentDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.push('/enrollment')}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
        aria-label="등록 관리 목록으로 돌아가기"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-xl font-bold text-gray-900">{missionName}</h1>
      <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
    </div>
  );
}
