'use client';

import {
  Badge,
  Pagination,
  SearchBox,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@samilhero/design-system';
import { TableEmptyState } from 'components/table/TableEmptyState';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MissionStatusChips, type StatusFilter } from './MissionStatusChips';
import { ProgressBar } from './ProgressBar';
import { MISSION_STATUS_LABEL } from '../../missions/_utils/missionStatus';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

const PAGE_SIZE = 20;

const STATUS_VARIANTS: Record<
  string,
  'success' | 'destructive' | 'info' | 'outline'
> = {
  ENROLLMENT_OPENED: 'info',
  ENROLLMENT_CLOSED: 'destructive',
  IN_PROGRESS: 'success',
  COMPLETED: 'outline',
};

const CATEGORY_LABELS: Record<string, string> = {
  DOMESTIC: '국내',
  ABROAD: '해외',
};

const CATEGORY_VARIANTS: Record<string, 'outline'> = {
  DOMESTIC: 'outline',
  ABROAD: 'outline',
};

const STATUS_SORT_ORDER: Record<string, number> = {
  ENROLLMENT_OPENED: 0,
  ENROLLMENT_CLOSED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  const target = new Date(deadline);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDeadlineDate(deadline: string): string {
  const date = new Date(deadline);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
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

  // 상태 필터
  const filteredByStatus =
    statusFilter === 'ALL'
      ? missions
      : missions.filter((m) => m.status === statusFilter);

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
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip">
      {/* 섹션 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <p className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
          선교 목록
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {total}
          </span>
        </p>
      </div>

      {/* 필터 툴바 */}
      <div className="shrink-0 flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex-1 max-w-[280px]">
          <SearchBox
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="선교명 검색..."
            size="sm"
          />
        </div>
        <div className="w-px h-[18px] bg-gray-200" />
        <MissionStatusChips
          value={statusFilter}
          onChange={handleStatusFilterChange}
        />
      </div>

      {/* 테이블 */}
      <div className="flex-1 min-h-0 overflow-auto">
        <Table>
          <TableCaption>선교 등록 현황</TableCaption>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead>선교명</TableHead>
              <TableHead className="w-20">카테고리</TableHead>
              <TableHead className="w-36">신청 마감</TableHead>
              <TableHead className="w-28">등록자 / 정원</TableHead>
              <TableHead className="w-32">달성률</TableHead>
              <TableHead className="w-20">납부완료</TableHead>
              <TableHead className="w-24">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                  <TableRow
                    key={mission.id}
                    onClick={() => handleRowClick(mission.id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-semibold text-gray-700">
                      {mission.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={CATEGORY_VARIANTS[mission.category] ?? 'info'}
                      >
                        {CATEGORY_LABELS[mission.category] ?? mission.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {mission.enrollmentDeadline ? (
                        <>
                          {formatDeadlineDate(mission.enrollmentDeadline)}
                          {daysLeft !== null && (
                            <span className="ml-1.5 text-gray-400">
                              {daysLeft < 0 ? '(마감)' : `(D-${daysLeft})`}
                            </span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {mission.currentParticipantCount}
                      {mission.maximumParticipantCount ? (
                        <> / {mission.maximumParticipantCount}명</>
                      ) : (
                        <>
                          명{' '}
                          <span className="text-xs text-gray-400 font-normal">
                            미설정
                          </span>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {progressPercent !== null ? (
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={progressPercent}
                            className={`h-1.5 w-20 ${
                              progressPercent > 100
                                ? 'text-warning-60'
                                : 'text-blue-60'
                            }`}
                          />
                          <span
                            className={`text-xs ${
                              progressPercent > 100
                                ? 'font-semibold text-warning-60'
                                : 'text-gray-500'
                            }`}
                          >
                            {progressPercent}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>{mission.paidCount}명</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={STATUS_VARIANTS[mission.status] ?? 'outline'}
                        >
                          {MISSION_STATUS_LABEL[mission.status] ??
                            mission.status}
                        </Badge>
                        {mission.status === 'ENROLLMENT_OPENED' &&
                          !mission.isAcceptingResponses && (
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                              등록 일시 중지
                            </span>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {total > 0
            ? `${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, total)} / 전체 ${total}건`
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
