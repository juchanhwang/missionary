'use client';

import {
  overlay,
  Pagination,
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@samilhero/design-system';
import { TableEmptyState, TableSkeleton } from 'components/table';
import { PANEL_TRANSITION_MS } from 'components/ui/SidePanel';
import { useAuth } from 'lib/auth/AuthContext';
import { useState } from 'react';

import { BulkApproveModal } from './BulkApproveModal';
import { EnrollmentToolbar } from './EnrollmentToolbar';
import { ParticipantRow } from './ParticipantRow';
import { useBulkApprovePayment } from '../_hooks/useBulkApprovePayment';
import { useEnrollmentUrl } from '../_hooks/useEnrollmentUrl';
import { useTogglePayment } from '../_hooks/useTogglePayment';

import type {
  FormFieldDefinition,
  PaginatedParticipationsResponse,
} from 'apis/participation';
import type { SkeletonColumn } from 'components/table';

const PAGE_SIZE = 20;

interface ParticipantTableProps {
  data: PaginatedParticipationsResponse | undefined;
  isLoading: boolean;
  formFields: FormFieldDefinition[];
  missionaryId: string;
  missionName: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function ParticipantTable({
  data,
  isLoading,
  formFields,
  missionaryId,
  missionName,
  searchQuery,
  onSearchChange,
}: ParticipantTableProps) {
  const { searchParams, updateSearchParams } = useEnrollmentUrl();
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  const selectedParticipantId = searchParams.get('participantId');
  const currentPage = Number(searchParams.get('page') ?? '1');

  // 체크 선택 상태
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Mutations
  const togglePayment = useTogglePayment();
  const bulkApprove = useBulkApprovePayment();

  const participants = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const displayedFields = formFields.slice(0, 3);

  const isAllChecked =
    participants.length > 0 && participants.every((p) => checkedIds.has(p.id));

  // 필터/페이지 변경 시 체크 초기화 (렌더 시점 조건부 리셋)
  const filterKey = `${searchParams.get('isPaid') ?? ''}|${searchParams.get('attendanceType') ?? ''}|${currentPage}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setCheckedIds(new Set());
  }

  // --- 핸들러 ---

  const handleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCheckAll = () => {
    if (isAllChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(participants.map((p) => p.id)));
    }
  };

  const handleRowClick = (id: string) => {
    updateSearchParams({ participantId: id });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page > 1 ? String(page) : '' });
  };

  const handleTogglePayment = (id: string, isPaid: boolean) => {
    togglePayment.mutate({ id, isPaid });
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(checkedIds);
    const confirmed = await overlay.openAsync<boolean>(
      ({ isOpen, close, unmount }) => (
        <BulkApproveModal
          isOpen={isOpen}
          close={(result) => {
            close(result);
            setTimeout(unmount, PANEL_TRANSITION_MS);
          }}
          count={ids.length}
        />
      ),
    );

    if (confirmed) {
      bulkApprove.mutate(ids, {
        onSuccess: () => setCheckedIds(new Set()),
      });
    }
  };

  // --- Skeleton ---

  const baseColCount = 8 + displayedFields.length;
  const colCount = baseColCount + (isAdmin ? 1 : 0);

  const skeletonColumns: SkeletonColumn[] = [
    ...(isAdmin ? [{ width: 'w-4' as const }] : []),
    { width: 'w-24' as const },
    { width: 'w-16' as const },
    { width: 'w-20' as const },
    { width: 'w-20' as const },
    { width: 'w-16' as const },
    { width: 'w-10' as const },
    { width: 'w-14' as const, rounded: 'full' as const },
    { width: 'w-16' as const },
    ...displayedFields.map(() => ({ width: 'w-16' as const })),
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip">
      {/* 카드 헤더 */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-200 min-h-[61px] gap-4 flex-wrap">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
          등록자 목록
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {total}건
          </span>
        </p>
        <EnrollmentToolbar
          missionaryId={missionaryId}
          missionName={missionName}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCount={checkedIds.size}
          onBulkApprove={handleBulkApprove}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <Table style={{ minWidth: '1100px' }}>
          <TableCaption>등록자 목록</TableCaption>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              {isAdmin && (
                <TableHead className="w-[44px] px-3">
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleCheckAll}
                    aria-label="전체 선택"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
              )}
              <TableHead className="w-[140px]">등록일시</TableHead>
              <TableHead className="w-[100px]">이름</TableHead>
              <TableHead className="w-[110px]">생년월일</TableHead>
              <TableHead className="w-[120px]">소속</TableHead>
              <TableHead className="w-[110px]">참석 일정</TableHead>
              <TableHead className="w-[70px] text-center">기수</TableHead>
              <TableHead className="w-[90px]">납부 여부</TableHead>
              <TableHead className="w-[90px]">팀</TableHead>
              {displayedFields.map((field) => (
                <TableHead key={field.id} className="w-[100px]">
                  {field.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={skeletonColumns} rows={10} />
            ) : participants.length === 0 ? (
              <TableEmptyState colSpan={colCount} message="등록자가 없습니다" />
            ) : (
              participants.map((participant) => (
                <ParticipantRow
                  key={participant.id}
                  participant={participant}
                  isSelected={participant.id === selectedParticipantId}
                  isChecked={checkedIds.has(participant.id)}
                  showCheckbox={isAdmin}
                  customFields={displayedFields}
                  onCheck={handleCheck}
                  onClick={handleRowClick}
                  onTogglePayment={handleTogglePayment}
                />
              ))
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
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
