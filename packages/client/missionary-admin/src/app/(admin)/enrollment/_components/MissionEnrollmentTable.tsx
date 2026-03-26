'use client';

import { Badge, Pagination, SearchBox } from '@samilhero/design-system';
import { TableEmptyState } from 'components/table/TableEmptyState';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MissionStatusChips, type StatusFilter } from './MissionStatusChips';
import { ProgressBar } from './ProgressBar';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<string, string> = {
  ENROLLMENT_OPENED: '모집 중',
  ENROLLMENT_CLOSED: '모집 마감',
  COMPLETED: '종료',
};

const STATUS_VARIANTS: Record<
  string,
  'success' | 'warning' | 'default' | 'info'
> = {
  ENROLLMENT_OPENED: 'success',
  ENROLLMENT_CLOSED: 'warning',
  COMPLETED: 'default',
};

const STATUS_SORT_ORDER: Record<string, number> = {
  ENROLLMENT_OPENED: 0,
  ENROLLMENT_CLOSED: 1,
  COMPLETED: 2,
};

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const target = new Date(deadline);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface MissionEnrollmentTableProps {
  missions: EnrollmentMissionSummary[];
}

export function MissionEnrollmentTable({
  missions,
}: MissionEnrollmentTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ENROLLMENT_PREPARING 제외
  const tableMissions = missions.filter(
    (m) => m.status !== 'ENROLLMENT_PREPARING',
  );

  // 상태 필터
  const filteredByStatus =
    statusFilter === 'ALL'
      ? tableMissions
      : tableMissions.filter((m) => m.status === statusFilter);

  // 이름 검색 (클라이언트 사이드)
  const filteredMissions = searchQuery
    ? filteredByStatus.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredByStatus;

  // 정렬: 상태 우선, 동일 상태 내 마감일 오름차순
  const sortedMissions = [...filteredMissions].sort((a, b) => {
    const statusDiff =
      (STATUS_SORT_ORDER[a.status] ?? 99) - (STATUS_SORT_ORDER[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;

    const aDeadline = a.enrollmentDeadline ?? '';
    const bDeadline = b.enrollmentDeadline ?? '';
    return aDeadline.localeCompare(bDeadline);
  });

  // 페이지네이션
  const total = sortedMissions.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedMissions = sortedMissions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRowClick = (missionaryId: string) => {
    router.push(`/enrollment/${missionaryId}`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 헤더 + 필터 */}
      <div className="shrink-0 flex flex-col gap-3 px-5 py-3.5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
            전체 선교 등록 현황
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {total}건
            </span>
          </p>
          <SearchBox
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="선교명 검색"
            className="w-60"
          />
        </div>
        <MissionStatusChips
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
      </div>

      {/* 테이블 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                선교명
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-20">
                카테고리
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-28">
                신청 마감
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-24">
                등록자/정원
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-28">
                달성률
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-20">
                납부완료
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-20">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagedMissions.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                message="검색 결과가 없습니다"
                subMessage="필터를 변경하거나 검색어를 확인해주세요"
              />
            ) : (
              pagedMissions.map((mission) => {
                const daysLeft = getDaysUntilDeadline(
                  mission.enrollmentDeadline,
                );
                const progressPercent = mission.maximumParticipantCount
                  ? Math.round(
                      (mission.currentParticipantCount /
                        mission.maximumParticipantCount) *
                        100,
                    )
                  : null;

                return (
                  <tr
                    key={mission.id}
                    onClick={() => handleRowClick(mission.id)}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {mission.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {mission.category === 'DOMESTIC' ? '국내' : '해외'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {mission.enrollmentDeadline ? (
                        <span className="flex items-center gap-1">
                          {new Date(
                            mission.enrollmentDeadline,
                          ).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {daysLeft !== null && (
                            <span
                              className={`text-xs ${daysLeft <= 3 ? 'font-bold text-warning-70' : 'text-gray-400'}`}
                            >
                              (D-{daysLeft})
                            </span>
                          )}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mission.currentParticipantCount}
                      {mission.maximumParticipantCount
                        ? ` / ${mission.maximumParticipantCount}`
                        : '명'}
                    </td>
                    <td className="px-4 py-3">
                      {progressPercent !== null ? (
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={progressPercent}
                            className={`h-1.5 w-16 ${progressPercent > 100 ? 'bg-warning-70' : 'bg-blue-60'}`}
                          />
                          <span className="text-xs text-gray-500">
                            {progressPercent}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {mission.paidCount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={STATUS_VARIANTS[mission.status] ?? 'default'}
                      >
                        {STATUS_LABELS[mission.status] ?? mission.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {total > 0
            ? `${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, total)} / ${total}건`
            : '0건'}
        </p>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
