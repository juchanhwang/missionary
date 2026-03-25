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
import { RotateCcw } from 'lucide-react';

import type { DeletedRegionListItem } from 'apis/missionaryRegion';
import type { SkeletonColumn } from 'components/table';

const NULL_PLACEHOLDER = '—';
const DELETED_CELL = 'text-gray-400';
const DELETED_CELL_DATE = 'text-xs text-gray-400';

const SKELETON_COLUMNS: SkeletonColumn[] = [
  { width: 'w-16' },
  { width: 'w-20' },
  { width: 'w-12' },
  { width: 'w-24' },
  { width: 'w-28' },
  { width: 'w-20' },
  { width: 'w-20' },
  { width: 'w-24' },
  { width: 'w-20' },
  { width: 'w-12' },
];

interface DeletedRegionTableProps {
  regions: DeletedRegionListItem[];
  isLoading: boolean;
  onRestore: (region: DeletedRegionListItem) => void;
}

function formatAddress(region: DeletedRegionListItem): string {
  const parts = [region.addressBasic, region.addressDetail].filter(Boolean);
  return parts.join(' ') || '';
}

function DeletedRegionRow({
  region,
  onRestore,
}: {
  region: DeletedRegionListItem;
  onRestore: (region: DeletedRegionListItem) => void;
}) {
  const fullAddress = formatAddress(region);

  return (
    <TableRow>
      <TableCell className={`w-[130px] ${DELETED_CELL}`}>
        {region.missionGroup?.name ?? NULL_PLACEHOLDER}
      </TableCell>
      <TableCell className="w-[140px]">{region.name}</TableCell>
      <TableCell className={`w-[90px] ${DELETED_CELL}`}>
        {region.pastorName ?? NULL_PLACEHOLDER}
      </TableCell>
      <TableCell className={`w-[120px] ${DELETED_CELL}`}>
        {region.pastorPhone ?? NULL_PLACEHOLDER}
      </TableCell>
      <TableCell className={`whitespace-normal ${DELETED_CELL}`}>
        <div
          className="truncate max-w-[180px]"
          title={fullAddress || undefined}
        >
          {fullAddress || NULL_PLACEHOLDER}
        </div>
      </TableCell>
      <TableCell className={`w-[100px] ${DELETED_CELL_DATE}`}>
        {formatDate(region.createdAt)}
      </TableCell>
      <TableCell className={`w-[100px] ${DELETED_CELL_DATE}`}>
        {formatDate(region.updatedAt)}
      </TableCell>
      <TableCell className={`w-[150px] whitespace-normal ${DELETED_CELL}`}>
        <div
          className="truncate max-w-[150px]"
          title={region.note || undefined}
        >
          {region.note || NULL_PLACEHOLDER}
        </div>
      </TableCell>
      <TableCell className={`w-[100px] ${DELETED_CELL_DATE}`}>
        {formatDate(region.deletedAt)}
      </TableCell>
      <TableCell className="w-[72px] text-center">
        <Button
          variant="outline"
          size="sm"
          className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
          onClick={() => onRestore(region)}
          aria-label={`${region.name} 복구`}
        >
          <RotateCcw size={11} />
          복구
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function DeletedRegionTable({
  regions,
  isLoading,
  onRestore,
}: DeletedRegionTableProps) {
  return (
    <div className="overflow-auto">
      <Table style={{ minWidth: '860px' }}>
        <TableCaption>삭제된 연계지 목록</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[130px]">선교 그룹</TableHead>
            <TableHead className="w-[140px]">연계지</TableHead>
            <TableHead className="w-[90px]">목사명</TableHead>
            <TableHead className="w-[120px]">목사연락처</TableHead>
            <TableHead>주소</TableHead>
            <TableHead className="w-[100px]">생성일</TableHead>
            <TableHead className="w-[100px]">수정일</TableHead>
            <TableHead className="w-[150px]">비고</TableHead>
            <TableHead className="w-[100px]">삭제일</TableHead>
            <TableHead className="w-[72px] text-center">복구</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={SKELETON_COLUMNS} rows={3} />
          ) : regions.length === 0 ? (
            <TableEmptyState colSpan={10} message="삭제된 연계지가 없습니다" />
          ) : (
            regions.map((r) => (
              <DeletedRegionRow key={r.id} region={r} onRestore={onRestore} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
