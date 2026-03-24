'use client';

import { Button } from '@samilhero/design-system';
import { AdminTable, NULL_PLACEHOLDER, type Column } from 'components/table';
import { formatDate } from 'lib/utils/formatDate';
import { RotateCcw } from 'lucide-react';

import type { DeletedRegionListItem } from 'apis/missionaryRegion';

interface DeletedRegionTableProps {
  regions: DeletedRegionListItem[];
  isLoading: boolean;
  onRestore: (region: DeletedRegionListItem) => void;
}

function formatAddress(region: DeletedRegionListItem): string {
  const parts = [region.addressBasic, region.addressDetail].filter(Boolean);
  return parts.join(' ') || '';
}

const DELETED_CELL = 'px-5 py-3.5 text-sm text-gray-400 whitespace-nowrap';
const DELETED_CELL_DATE = 'px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap';

function buildColumns(
  onRestore: (region: DeletedRegionListItem) => void,
): Column<DeletedRegionListItem>[] {
  return [
    {
      key: 'group',
      header: '선교 그룹',
      width: 'w-[130px]',
      cellClassName: DELETED_CELL,
      render: (r) => r.missionGroup?.name ?? NULL_PLACEHOLDER,
      skeleton: { width: 'w-16' },
    },
    {
      key: 'name',
      header: '연계지',
      width: 'w-[140px]',
      cellClassName: 'px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap',
      render: (r) => r.name,
      skeleton: { width: 'w-20' },
    },
    {
      key: 'pastorName',
      header: '목사명',
      width: 'w-[90px]',
      cellClassName: DELETED_CELL,
      render: (r) => r.pastorName ?? NULL_PLACEHOLDER,
      skeleton: { width: 'w-12' },
    },
    {
      key: 'pastorPhone',
      header: '목사연락처',
      width: 'w-[120px]',
      cellClassName: DELETED_CELL,
      render: (r) => r.pastorPhone ?? NULL_PLACEHOLDER,
      skeleton: { width: 'w-24' },
    },
    {
      key: 'address',
      header: '주소',
      cellClassName: 'px-5 py-3.5 text-sm text-gray-400',
      render: (r) => {
        const fullAddress = formatAddress(r);
        return (
          <div
            className="truncate max-w-[180px]"
            title={fullAddress || undefined}
          >
            {fullAddress || NULL_PLACEHOLDER}
          </div>
        );
      },
      skeleton: { width: 'w-28' },
    },
    {
      key: 'createdAt',
      header: '생성일',
      width: 'w-[100px]',
      cellClassName: DELETED_CELL_DATE,
      render: (r) => formatDate(r.createdAt),
      skeleton: { width: 'w-20' },
    },
    {
      key: 'updatedAt',
      header: '수정일',
      width: 'w-[100px]',
      cellClassName: DELETED_CELL_DATE,
      render: (r) => formatDate(r.updatedAt),
      skeleton: { width: 'w-20' },
    },
    {
      key: 'note',
      header: '비고',
      width: 'w-[150px]',
      cellClassName: 'px-5 py-3.5 text-sm text-gray-400',
      render: (r) => (
        <div className="truncate max-w-[150px]" title={r.note || undefined}>
          {r.note || NULL_PLACEHOLDER}
        </div>
      ),
      skeleton: { width: 'w-24' },
    },
    {
      key: 'deletedAt',
      header: '삭제일',
      width: 'w-[100px]',
      cellClassName: DELETED_CELL_DATE,
      render: (r) => formatDate(r.deletedAt),
      skeleton: { width: 'w-20' },
    },
    {
      key: 'restore',
      header: '복구',
      width: 'w-[72px]',
      headerClassName: 'text-center',
      cellClassName: 'px-5 py-3.5 text-center',
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
          onClick={() => onRestore(r)}
          aria-label={`${r.name} 복구`}
        >
          <RotateCcw size={11} />
          복구
        </Button>
      ),
      skeleton: { width: 'w-12' },
    },
  ];
}

export function DeletedRegionTable({
  regions,
  isLoading,
  onRestore,
}: DeletedRegionTableProps) {
  const columns = buildColumns(onRestore);

  return (
    <AdminTable
      data={regions}
      columns={columns}
      caption="삭제된 연계지 목록"
      getRowKey={(r) => r.id}
      isLoading={isLoading}
      skeletonRows={3}
      emptyMessage="삭제된 연계지가 없습니다"
      minWidth="860px"
      wrapperClassName="overflow-auto"
    />
  );
}
