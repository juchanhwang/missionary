'use client';

import { Button } from '@samilhero/design-system';
import { useParams, useRouter } from 'next/navigation';

import { MissionStatusBadge } from '../_components/MissionStatusBadge';
import { formatDate } from '../_utils/formatDate';
import { useMissionGroup } from './_hooks/useMissionGroup';

export default function MissionGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const { data: group, isLoading } = useMissionGroup(groupId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">로딩 중...</div>
    );
  }

  if (!group) {
    return (
      <div className="flex justify-center items-center h-full">
        그룹을 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/missions')}
        >
          ← 목록
        </Button>
        <h1 className="text-xl font-bold text-gray-90">{group.name}</h1>
        <div className="ml-auto">
          <Button
            color="neutral"
            size="md"
            onClick={() => router.push(`/missions/${groupId}/missions/create`)}
          >
            N차 선교 생성
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-10 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-10">
              <th className="px-6 py-3 text-xs font-semibold text-gray-40 uppercase tracking-wider">
                선교명
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-40 uppercase tracking-wider">
                차수
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-40 uppercase tracking-wider">
                기간
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-40 uppercase tracking-wider">
                담당 교역자
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-40 uppercase tracking-wider">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-20">
            {group.missionaries?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-40">
                  등록된 선교가 없습니다.
                </td>
              </tr>
            ) : (
              group.missionaries?.map((mission) => (
                <tr
                  key={mission.id}
                  className="hover:bg-gray-10 cursor-pointer transition-colors"
                  onClick={() =>
                    router.push(
                      `/missions/${groupId}/missions/${mission.id}/edit`,
                    )
                  }
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-90">
                    {mission.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-50">
                    {mission.order}차
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-50">
                    {formatDate(mission.startDate)} ~{' '}
                    {formatDate(mission.endDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-50">
                    {mission.pastorName}
                  </td>
                  <td className="px-6 py-4 text-sm">
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
