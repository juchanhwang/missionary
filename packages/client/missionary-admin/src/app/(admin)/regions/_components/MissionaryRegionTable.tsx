'use client';

import {
  Button,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@samilhero/design-system';
import { TableEmptyState, TableSkeleton } from 'components/table';
import { formatDate } from 'lib/utils/formatDate';
import { Pencil, Trash2 } from 'lucide-react';

import type { RegionListItem } from 'apis/missionaryRegion';
import type { SkeletonColumn } from 'components/table';

const NULL_PLACEHOLDER = '—';

interface MissionaryRegionTableProps {
  regions: RegionListItem[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (region: RegionListItem) => void;
  onDelete: (region: RegionListItem) => void;
}

function formatAddress(region: RegionListItem): string {
  const parts = [region.addressBasic, region.addressDetail].filter(Boolean);
  return parts.join(' ') || '';
}

function getSkeletonColumns(isAdmin: boolean): SkeletonColumn[] {
  const columns: SkeletonColumn[] = [
    { width: 'w-20' },
    { width: 'w-20' },
    { width: 'w-12' },
    { width: 'w-28' },
    { width: 'w-32' },
    { width: 'w-20' },
    { width: 'w-20' },
    { width: 'w-24' },
  ];
  if (isAdmin) {
    columns.push({ width: 'w-7' });
  }
  return columns;
}

function RegionRow({
  region,
  isAdmin,
  onEdit,
  onDelete,
}: {
  region: RegionListItem;
  isAdmin: boolean;
  onEdit: (region: RegionListItem) => void;
  onDelete: (region: RegionListItem) => void;
}) {
  const fullAddress = formatAddress(region);

  return (
    <TableRow
      className={isAdmin ? 'cursor-pointer hover:bg-gray-50' : undefined}
      onClick={isAdmin ? () => onEdit(region) : undefined}
      tabIndex={isAdmin ? 0 : undefined}
      onKeyDown={
        isAdmin
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter') onEdit(region);
            }
          : undefined
      }
    >
      <TableCell className="w-[140px]">
        {region.missionGroup?.name ?? NULL_PLACEHOLDER}
      </TableCell>
      <TableCell className="w-[140px] font-semibold text-gray-900">
        {region.name}
      </TableCell>
      <TableCell className="w-[100px]">
        {region.pastorName ?? NULL_PLACEHOLDER}
      </TableCell>
      <TableCell className="w-[130px]">
        {region.pastorPhone ?? NULL_PLACEHOLDER}
      </TableCell>
      <TableCell className="whitespace-normal">
        <div
          className="truncate max-w-[200px]"
          title={fullAddress || undefined}
        >
          {fullAddress || NULL_PLACEHOLDER}
        </div>
      </TableCell>
      <TableCell className="w-[100px] text-xs text-gray-400">
        {formatDate(region.createdAt)}
      </TableCell>
      <TableCell className="w-[100px] text-xs text-gray-400">
        {formatDate(region.updatedAt)}
      </TableCell>
      <TableCell className="w-[150px] whitespace-normal">
        <div
          className="truncate max-w-[150px]"
          title={region.note || undefined}
        >
          {region.note || NULL_PLACEHOLDER}
        </div>
      </TableCell>
      {isAdmin && (
        <TableCell className="w-[112px] text-center">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              color="neutral"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEdit(region);
              }}
              aria-label={`${region.name} 수정`}
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="outline"
              color="neutral"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete(region);
              }}
              aria-label={`${region.name} 삭제`}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

export function MissionaryRegionTable({
  regions,
  isLoading,
  isAdmin,
  onEdit,
  onDelete,
}: MissionaryRegionTableProps) {
  const colCount = isAdmin ? 9 : 8;
  const skeletonColumns = getSkeletonColumns(isAdmin);

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <Table style={{ minWidth: '900px' }}>
        <TableCaption>연계지 목록</TableCaption>
        <TableHeader className="sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[140px]">선교 그룹</TableHead>
            <TableHead className="w-[140px]">연계지</TableHead>
            <TableHead className="w-[100px]">목사명</TableHead>
            <TableHead className="w-[130px]">목사연락처</TableHead>
            <TableHead>주소</TableHead>
            <TableHead className="w-[100px]">생성일</TableHead>
            <TableHead className="w-[100px]">수정일</TableHead>
            <TableHead className="w-[150px]">비고</TableHead>
            {isAdmin && (
              <TableHead className="w-[112px] text-center">액션</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={skeletonColumns} />
          ) : regions.length === 0 ? (
            <TableEmptyState
              colSpan={colCount}
              message="조건에 맞는 연계지가 없습니다"
            />
          ) : (
            regions.map((r) => (
              <RegionRow
                key={r.id}
                region={r}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
