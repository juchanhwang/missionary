'use client';

import { Button } from '@samilhero/design-system';
import {
  AdminTable,
  NULL_PLACEHOLDER,
  TABLE_STYLES,
  type Column,
} from 'components/table';
import { formatDate } from 'lib/utils/formatDate';
import { Pencil, Trash2 } from 'lucide-react';

import type { RegionListItem } from 'apis/missionaryRegion';

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

function buildColumns(
  isAdmin: boolean,
  onEdit: (region: RegionListItem) => void,
  onDelete: (region: RegionListItem) => void,
): Column<RegionListItem>[] {
  const columns: Column<RegionListItem>[] = [
    {
      key: 'group',
      header: '선교 그룹',
      width: 'w-[140px]',
      render: (r) => r.missionGroup?.name ?? NULL_PLACEHOLDER,
      skeleton: { width: 'w-20' },
    },
    {
      key: 'name',
      header: '연계지',
      width: 'w-[140px]',
      render: (r) => r.name,
      skeleton: { width: 'w-20' },
    },
    {
      key: 'pastorName',
      header: '목사명',
      width: 'w-[100px]',
      render: (r) => r.pastorName ?? NULL_PLACEHOLDER,
      skeleton: { width: 'w-12' },
    },
    {
      key: 'pastorPhone',
      header: '목사연락처',
      width: 'w-[130px]',
      render: (r) => r.pastorPhone ?? NULL_PLACEHOLDER,
      skeleton: { width: 'w-28' },
    },
    {
      key: 'address',
      header: '주소',
      cellClassName: 'px-5 py-3.5 text-sm text-gray-500',
      render: (r) => {
        const fullAddress = formatAddress(r);
        return (
          <div
            className="truncate max-w-[200px]"
            title={fullAddress || undefined}
          >
            {fullAddress || NULL_PLACEHOLDER}
          </div>
        );
      },
      skeleton: { width: 'w-32' },
    },
    {
      key: 'createdAt',
      header: '생성일',
      width: 'w-[100px]',
      cellClassName: TABLE_STYLES.bodyCellDate,
      render: (r) => formatDate(r.createdAt),
      skeleton: { width: 'w-20' },
    },
    {
      key: 'updatedAt',
      header: '수정일',
      width: 'w-[100px]',
      cellClassName: TABLE_STYLES.bodyCellDate,
      render: (r) => formatDate(r.updatedAt),
      skeleton: { width: 'w-20' },
    },
    {
      key: 'note',
      header: '비고',
      width: 'w-[150px]',
      cellClassName: 'px-5 py-3.5 text-sm text-gray-500',
      render: (r) => (
        <div className="truncate max-w-[150px]" title={r.note || undefined}>
          {r.note || NULL_PLACEHOLDER}
        </div>
      ),
      skeleton: { width: 'w-24' },
    },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: '액션',
      width: 'w-[112px]',
      headerClassName: 'text-center',
      cellClassName: 'px-5 py-3.5 whitespace-nowrap text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onEdit(r);
            }}
            aria-label={`${r.name} 수정`}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete(r);
            }}
            aria-label={`${r.name} 삭제`}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
      skeleton: { width: 'w-7' },
    });
  }

  return columns;
}

export function MissionaryRegionTable({
  regions,
  isLoading,
  isAdmin,
  onEdit,
  onDelete,
}: MissionaryRegionTableProps) {
  const columns = buildColumns(isAdmin, onEdit, onDelete);

  return (
    <AdminTable
      data={regions}
      columns={columns}
      caption="연계지 목록"
      getRowKey={(r) => r.id}
      isLoading={isLoading}
      onRowClick={isAdmin ? onEdit : undefined}
      stickyHeader
      minWidth="900px"
      emptyMessage="조건에 맞는 연계지가 없습니다"
    />
  );
}
