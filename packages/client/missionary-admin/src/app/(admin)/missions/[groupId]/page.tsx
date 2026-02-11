'use client';

import { Button } from '@samilhero/design-system';
import { useParams, useRouter } from 'next/navigation';

import { MissionStatusBadge } from '../components/MissionStatusBadge';
import { formatDate } from '../utils/formatDate';
import { useMissionGroup } from './hooks/useMissionGroup';

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/missions')}
        >
          ← 목록
        </Button>
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <div className="ml-auto">
          <Button
            color="primary"
            onClick={() => router.push(`/missions/${groupId}/missions/create`)}
          >
            N차 선교 생성
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">
                선교명
              </th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">
                차수
              </th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">
                기간
              </th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">
                담당 교역자
              </th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {group.missionaries?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  등록된 선교가 없습니다.
                </td>
              </tr>
            ) : (
              group.missionaries?.map((mission) => (
                <tr
                  key={mission.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() =>
                    router.push(
                      `/missions/${groupId}/missions/${mission.id}/edit`,
                    )
                  }
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {mission.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {mission.order}차
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(mission.startDate)} ~{' '}
                    {formatDate(mission.endDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
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
