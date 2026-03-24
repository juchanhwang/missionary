'use client';

import { Button } from '@samilhero/design-system';
import { type Missionary } from 'apis/missionary';
import { type MissionGroupDetail as MissionGroupDetailType } from 'apis/missionGroup';
import { AdminTable, NULL_PLACEHOLDER, type Column } from 'components/table';
import { formatDateDotted } from 'lib/utils/formatDate';
import { CalendarX, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CategoryBadge } from '../../_components/CategoryBadge';
import { MissionStatusBadge } from '../../_components/MissionStatusBadge';
import { useMissionGroupId } from '../_hooks/useMissionGroupId';

interface MissionGroupDetailProps {
  group: MissionGroupDetailType;
}

function buildColumns(groupId: string): Column<Missionary>[] {
  return [
    {
      key: 'name',
      header: '선교명',
      cellClassName: 'px-5 py-3.5 text-sm font-medium text-gray-900',
      render: (m) => (
        <Link
          href={`/missions/${groupId}/${m.id}/edit`}
          className="text-sm font-medium text-gray-900 hover:text-primary-60 hover:underline"
        >
          {m.name}
        </Link>
      ),
      skeleton: { width: 'w-24' },
    },
    {
      key: 'order',
      header: '차수',
      render: (m) => `${m.order}차`,
      skeleton: { width: 'w-12' },
    },
    {
      key: 'period',
      header: '선교 기간',
      render: (m) =>
        `${formatDateDotted(m.startDate)} ~ ${formatDateDotted(m.endDate)}`,
      skeleton: { width: 'w-32' },
    },
    {
      key: 'pastorName',
      header: '담당 교역자',
      render: (m) => m.pastorName || NULL_PLACEHOLDER,
      skeleton: { width: 'w-16' },
    },
    {
      key: 'maxParticipants',
      header: '최대 인원',
      render: (m) =>
        m.maximumParticipantCount != null
          ? `${m.maximumParticipantCount}명`
          : NULL_PLACEHOLDER,
      skeleton: { width: 'w-12' },
    },
    {
      key: 'status',
      header: '상태',
      cellClassName: 'px-5 py-3.5',
      render: (m) => <MissionStatusBadge status={m.status} />,
      skeleton: { width: 'w-16', rounded: 'full' },
    },
  ];
}

export function MissionGroupDetail({ group }: MissionGroupDetailProps) {
  const router = useRouter();
  const groupId = useMissionGroupId();

  const missionaries = group.missionaries ?? [];
  const columns = buildColumns(groupId);

  return (
    <div className="flex flex-col flex-1 p-8 gap-5 overflow-y-auto">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-gray-900">
              {group.name}
            </h2>
            <CategoryBadge category={group.category} />
            <button
              type="button"
              onClick={() => router.push(`/missions/${groupId}/edit-group`)}
              className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
              aria-label="그룹 수정"
            >
              <Pencil size={14} />
            </button>
          </div>
          {group.description && (
            <p className="text-sm text-gray-400">{group.description}</p>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => router.push(`/missions/${groupId}/create`)}
        >
          선교 추가
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">
            선교 목록
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              {missionaries.length}건
            </span>
          </p>
        </div>

        <AdminTable
          data={missionaries}
          columns={columns}
          caption={`${group.name} 선교 목록`}
          getRowKey={(m) => m.id}
          emptyIcon={<CalendarX size={32} className="text-gray-300" />}
          emptyMessage="등록된 선교가 없습니다"
          emptySubMessage="'선교 추가' 버튼으로 새 선교를 등록하세요"
          rowClassName="hover:bg-gray-50"
          wrapperClassName=""
        />
      </div>
    </div>
  );
}
