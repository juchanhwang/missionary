'use client';

import { Button } from '@samilhero/design-system';
import Link from 'next/link';

import { useMissionGroups } from './hooks/useMissionGroups';
import { formatDate } from './utils/formatDate';

export default function MissionsPage() {
  const { data: missionGroups, isLoading } = useMissionGroups();

  if (isLoading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">선교 그룹 목록</h1>
        <Link href="/missions/create">
          <Button color="primary">신규 선교 그룹 생성</Button>
        </Link>
      </div>

      {!missionGroups || missionGroups.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          등록된 선교 그룹이 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700">
                  그룹명
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  타입
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  소속 선교 수
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  생성일
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {missionGroups.map((group) => (
                <tr
                  key={group.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <Link
                      href={`/missions/${group.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {group.name}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600">
                    {group.type === 'DOMESTIC' ? '국내' : '해외'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {group._count?.missionaries ?? 0}개
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(group.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
