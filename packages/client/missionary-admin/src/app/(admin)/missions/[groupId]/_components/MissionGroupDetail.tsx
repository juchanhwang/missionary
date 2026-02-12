'use client';

import { Button } from '@samilhero/design-system';
import { CalendarX, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { MissionStatusBadge } from '../../_components/MissionStatusBadge';
import { formatDate } from '../../_utils/formatDate';
import { useSuspenseGetMissionGroup } from '../_hooks/useSuspenseGetMissionGroup';

export function MissionGroupDetail() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const { data: group } = useSuspenseGetMissionGroup(groupId);

  if (!group) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-sm text-gray-50">그룹을 찾을 수 없습니다</p>
      </div>
    );
  }

  const missionCount = group.missionaries?.length ?? 0;

  return (
    <div className="flex flex-col flex-1 p-8 gap-5 overflow-y-auto">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-gray-90">{group.name}</h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                group.type === 'ABROAD'
                  ? 'bg-blue-10 text-blue-60'
                  : 'bg-green-10 text-green-60'
              }`}
            >
              {group.type === 'ABROAD' ? '해외' : '국내'}
            </span>
            <button
              type="button"
              onClick={() => router.push(`/missions/${groupId}/edit-group`)}
              className="p-1 text-gray-50 hover:text-gray-90 transition-colors"
              aria-label="그룹 수정"
            >
              <Pencil size={14} />
            </button>
          </div>
          {group.description && (
            <p className="text-sm text-gray-50">{group.description}</p>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => router.push(`/missions/${groupId}/create`)}
        >
          선교 추가
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-30 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-30">
          <p className="text-sm font-semibold text-gray-90">
            선교 목록
            <span className="ml-1.5 text-xs font-normal text-gray-50">
              {missionCount}건
            </span>
          </p>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-30 bg-gray-10">
              <th className="px-5 py-3 text-xs font-medium text-gray-50">
                선교명
              </th>
              <th className="px-5 py-3 text-xs font-medium text-gray-50">
                차수
              </th>
              <th className="px-5 py-3 text-xs font-medium text-gray-50">
                선교 기간
              </th>
              <th className="px-5 py-3 text-xs font-medium text-gray-50">
                담당 교역자
              </th>
              <th className="px-5 py-3 text-xs font-medium text-gray-50">
                최대 인원
              </th>
              <th className="px-5 py-3 text-xs font-medium text-gray-50">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {missionCount === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <CalendarX size={32} className="text-gray-40" />
                    <p className="text-sm text-gray-50">
                      등록된 선교가 없습니다
                    </p>
                    <p className="text-xs text-gray-40">
                      &apos;선교 추가&apos; 버튼으로 새 선교를 등록하세요
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              group.missionaries?.map((mission) => (
                <tr
                  key={mission.id}
                  className="border-b border-gray-30 last:border-b-0 hover:bg-gray-10 transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-90">
                    <Link
                      href={`/missions/${groupId}/${mission.id}/edit`}
                      className="text-sm font-medium text-gray-90 hover:text-primary-60 hover:underline"
                    >
                      {mission.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-60">
                    {mission.order}차
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-60">
                    {formatDate(mission.startDate)} ~{' '}
                    {formatDate(mission.endDate)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-60">
                    {mission.pastorName || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-60">
                    {mission.maximumParticipantCount != null
                      ? `${mission.maximumParticipantCount}명`
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <MissionStatusBadge status={mission.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
