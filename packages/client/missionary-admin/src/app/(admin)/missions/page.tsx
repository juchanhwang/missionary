'use client';

import { Button } from '@samilhero/design-system';
import Link from 'next/link';

import { useMissionGroups } from './_hooks/useMissionGroups';
import { formatDate } from './_utils/formatDate';

export default function MissionsPage() {
  const { data: missionGroups, isLoading } = useMissionGroups();

  if (isLoading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-90">선교 그룹 목록</h1>
        <Link href="/missions/create">
          <Button color="neutral" size="md">
            신규 선교 그룹 생성
          </Button>
        </Link>
      </div>

      {!missionGroups || missionGroups.length === 0 ? (
        <div className="text-center py-10 text-gray-40">
          등록된 선교 그룹이 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-10 bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-10">
                <th className="p-4 text-left text-xs font-semibold text-gray-40 uppercase tracking-wider">
                  그룹명
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-40 uppercase tracking-wider">
                  타입
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-40 uppercase tracking-wider">
                  소속 선교 수
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-40 uppercase tracking-wider">
                  생성일
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-20">
              {missionGroups.map((group) => (
                <tr
                  key={group.id}
                  className="hover:bg-gray-10 transition-colors"
                >
                  <td className="p-4">
                    <Link
                      href={`/missions/${group.id}`}
                      className="text-gray-70 hover:text-gray-90 hover:underline font-medium"
                    >
                      {group.name}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-gray-50">
                    {group.type === 'DOMESTIC' ? '국내' : '해외'}
                  </td>
                  <td className="p-4 text-sm text-gray-50">
                    {group._count?.missionaries ?? 0}개
                  </td>
                  <td className="p-4 text-sm text-gray-50">
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
