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
import { type Missionary } from 'apis/missionary';
import { type MissionGroupDetail as MissionGroupDetailType } from 'apis/missionGroup';
import { TableEmptyState } from 'components/table';
import { formatDateDotted } from 'lib/utils/formatDate';
import { CalendarX, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CategoryBadge } from '../../_components/CategoryBadge';
import { MissionStatusBadge } from '../../_components/MissionStatusBadge';
import { useMissionGroupId } from '../_hooks/useMissionGroupId';

const NULL_PLACEHOLDER = '—';

interface MissionGroupDetailProps {
  group: MissionGroupDetailType;
}

function MissionaryRow({
  missionary,
  groupId,
}: {
  missionary: Missionary;
  groupId: string;
}) {
  const href = `/missions/${groupId}/${missionary.id}/edit`;

  return (
    <TableRow className="relative hover:bg-gray-50">
      <TableCell className="font-semibold text-gray-900">
        <Link
          href={href}
          className="after:absolute after:inset-0 hover:text-primary-60 hover:underline"
        >
          {missionary.name}
        </Link>
      </TableCell>
      <TableCell>{`${missionary.order}차`}</TableCell>
      <TableCell>
        {`${formatDateDotted(missionary.startDate)} ~ ${formatDateDotted(missionary.endDate)}`}
      </TableCell>
      <TableCell>{missionary.pastorName || NULL_PLACEHOLDER}</TableCell>
      <TableCell>
        {missionary.maximumParticipantCount != null
          ? `${missionary.maximumParticipantCount}명`
          : NULL_PLACEHOLDER}
      </TableCell>
      <TableCell>
        <MissionStatusBadge status={missionary.status} />
      </TableCell>
    </TableRow>
  );
}

export function MissionGroupDetail({ group }: MissionGroupDetailProps) {
  const router = useRouter();
  const groupId = useMissionGroupId();

  const missionaries = group.missionaries ?? [];

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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 min-h-[61px]">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
            선교 목록
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {missionaries.length}건
            </span>
          </p>
        </div>

        <Table>
          <TableCaption>{`${group.name} 선교 목록`}</TableCaption>
          <TableHeader className="sticky top-0 z-10">
            <TableRow>
              <TableHead>선교명</TableHead>
              <TableHead>차수</TableHead>
              <TableHead>선교 기간</TableHead>
              <TableHead>담당 교역자</TableHead>
              <TableHead>최대 인원</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missionaries.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon={<CalendarX size={32} className="text-gray-300" />}
                message="등록된 선교가 없습니다"
                subMessage="'선교 추가' 버튼으로 새 선교를 등록하세요"
              />
            ) : (
              missionaries.map((m) => (
                <MissionaryRow key={m.id} missionary={m} groupId={groupId} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
