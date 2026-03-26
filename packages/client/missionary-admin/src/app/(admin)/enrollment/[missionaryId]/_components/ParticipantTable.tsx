'use client';

import { Pagination } from '@samilhero/design-system';
import { TableEmptyState } from 'components/table/TableEmptyState';
import { TableSkeleton } from 'components/table/TableSkeleton';

import { ParticipantRow } from './ParticipantRow';

import type {
  FormFieldDefinition,
  PaginatedParticipationsResponse,
} from 'apis/participation';

interface ParticipantTableProps {
  data: PaginatedParticipationsResponse | undefined;
  isLoading: boolean;
  searchQuery: string;
  selectedParticipantId: string | null;
  checkedIds: Set<string>;
  showCheckbox: boolean;
  customFields: FormFieldDefinition[];
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
  searchQuery,
  selectedParticipantId,
  checkedIds,
  showCheckbox,
  customFields,
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
  const participants = data?.items ?? [];

  // 클라이언트 사이드 이름 검색
  const filteredParticipants = searchQuery
    ? participants.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : participants;

  const displayedFields = customFields.slice(0, 3);
  const colCount = 9 + displayedFields.length + (showCheckbox ? 1 : 0);

  const isAllChecked =
    filteredParticipants.length > 0 &&
    filteredParticipants.every((p) => checkedIds.has(p.id));

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              {showCheckbox && (
                <th className="w-[44px] px-3 py-3">
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={onCheckAll}
                    aria-label="전체 선택"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
              )}
              <th className="w-[140px] px-4 py-3 text-left text-xs font-medium text-gray-500">
                등록일시
              </th>
              <th className="w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500">
                이름
              </th>
              <th className="w-[110px] px-4 py-3 text-left text-xs font-medium text-gray-500">
                생년월일
              </th>
              <th className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500">
                소속
              </th>
              <th className="w-[110px] px-4 py-3 text-left text-xs font-medium text-gray-500">
                참석 일정
              </th>
              <th className="w-[70px] px-4 py-3 text-center text-xs font-medium text-gray-500">
                기수
              </th>
              <th className="w-[90px] px-4 py-3 text-left text-xs font-medium text-gray-500">
                납부 여부
              </th>
              <th className="w-[90px] px-4 py-3 text-left text-xs font-medium text-gray-500">
                팀
              </th>
              {displayedFields.map((field) => (
                <th
                  key={field.id}
                  className="w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500"
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <TableSkeleton
                columns={Array.from({ length: colCount }, () => ({
                  width: 'w-16',
                }))}
                rows={10}
              />
            ) : filteredParticipants.length === 0 ? (
              <TableEmptyState
                colSpan={colCount}
                message="등록자가 없습니다"
                subMessage={
                  searchQuery
                    ? '검색 결과가 없습니다. 검색어를 확인해주세요.'
                    : undefined
                }
              />
            ) : (
              filteredParticipants.map((participant) => (
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
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {total > 0
            ? `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, total)} / ${total}건`
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
