'use client';

import Link from 'next/link';

import { HighlightCardSection } from './HighlightCardSection';
import { MissionEnrollmentTable } from './MissionEnrollmentTable';
import { useGetEnrollmentSummary } from '../_hooks/useGetEnrollmentSummary';

import type { GetEnrollmentSummaryResponse } from 'apis/enrollment';

interface EnrollmentListPageProps {
  initialData: GetEnrollmentSummaryResponse;
}

export function EnrollmentListPage({ initialData }: EnrollmentListPageProps) {
  const { data } = useGetEnrollmentSummary({ initialData });

  const missions = data?.missions ?? [];
  const hasRecruiting = missions.some((m) => m.status === 'ENROLLMENT_OPENED');

  return (
    <div className="flex flex-col flex-1 min-h-0 p-8 gap-6">
      {/* 요약 통계 */}
      {data && (
        <div className="flex justify-end">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-60 inline-block" />
              모집 중 {data.totalRecruitingCount}건
            </span>
            <span className="text-gray-300">|</span>
            <span>총 신청 {data.totalRecruitingParticipants}명</span>
          </div>
        </div>
      )}

      {/* Section A: 마감 임박 카드 */}
      <HighlightCardSection missions={missions} />

      {/* 모집 중 0개 안내 */}
      {!hasRecruiting && missions.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
          <span>현재 모집 중인 선교가 없습니다.</span>
          <Link
            href="/missions"
            className="text-primary-50 hover:underline font-medium"
          >
            선교 관리로 이동
          </Link>
        </div>
      )}

      {/* Section B: 통합 테이블 */}
      <MissionEnrollmentTable missions={missions} />
    </div>
  );
}
