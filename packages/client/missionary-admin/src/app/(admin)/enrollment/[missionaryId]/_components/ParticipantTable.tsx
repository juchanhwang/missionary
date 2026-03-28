'use client';

import {
  Pagination,
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@samilhero/design-system';
import { TableEmptyState, TableSkeleton } from 'components/table';

import { ParticipantRow } from './ParticipantRow';

import type {
  FormFieldDefinition,
  PaginatedParticipationsResponse,
} from 'apis/participation';
import type { SkeletonColumn } from 'components/table';

interface ParticipantTableProps {
  data: PaginatedParticipationsResponse | undefined;
  isLoading: boolean;
  selectedParticipantId: string | null;
  checkedIds: Set<string>;
  showCheckbox: boolean;
  customFields: FormFieldDefinition[];
  toolbar?: React.ReactNode;
  onCheck: (id: string) => void;
  onCheckAll: () => void;
  onClick: (id: string) => void;
  onTogglePayment: (id: string, isPaid: boolean) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ParticipantTable({
  data,
  isLoading,
  selectedParticipantId,
  checkedIds,
  showCheckbox,
  customFields,
  toolbar,
  onCheck,
  onCheckAll,
  onClick,
  onTogglePayment,
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: ParticipantTableProps) {
  const participants = data?.data ?? [];

  const displayedFields = customFields.slice(0, 3);
  const baseColCount = 8 + displayedFields.length;
  const colCount = baseColCount + (showCheckbox ? 1 : 0);

  const isAllChecked =
    participants.length > 0 && participants.every((p) => checkedIds.has(p.id));

  const skeletonColumns: SkeletonColumn[] = [
    ...(showCheckbox ? [{ width: 'w-4' as const }] : []),
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
        {toolbar}
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <Table style={{ minWidth: '1100px' }}>
          <TableCaption>등록자 목록</TableCaption>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              {showCheckbox && (
                <TableHead className="w-[44px] px-3">
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={onCheckAll}
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
                  showCheckbox={showCheckbox}
                  customFields={displayedFields}
                  onCheck={onCheck}
                  onClick={onClick}
                  onTogglePayment={onTogglePayment}
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
            ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, total)} / 전체 ${total}건`
            : '0건'}
        </p>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
