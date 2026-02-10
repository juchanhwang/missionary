'use client';

import { Button } from '@samilhero/design-system';
import { type Missionary } from 'apis/missionary';
import { useMissionaries } from 'hooks/missionary/useMissionaries';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { MissionStatusBadge } from './components/MissionStatusBadge';
import { formatDate } from './utils/formatDate';

function MissionListContent({
  missionaries,
  isLoading,
}: {
  missionaries: Missionary[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="text-center py-10">로딩 중...</div>;
  }

  const isEmpty = !missionaries || missionaries.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-10 text-gray-500">
        등록된 선교가 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3 text-left font-semibold text-gray-700">
              선교 이름
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">
              선교 기간
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">
              담당 교역자
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">상태</th>
          </tr>
        </thead>
        <tbody>
          {missionaries.map((missionary) => (
            <tr
              key={missionary.id}
              className="hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <td className="p-3 text-gray-900">
                <Link
                  href={`/missions/${missionary.id}/edit`}
                  className="text-primary-60 underline hover:text-primary-70"
                >
                  {missionary.name}
                </Link>
              </td>
              <td className="p-3 text-gray-600">
                {formatDate(missionary.startDate)} ~{' '}
                {formatDate(missionary.endDate)}
              </td>
              <td className="p-3 text-gray-900">
                {missionary.pastorName || '-'}
              </td>
              <td className="p-3">
                <MissionStatusBadge status={missionary.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MissionsPage() {
  const searchParams = useSearchParams();
  const nameFilter = searchParams.get('name');
  const { data: missionaries, isLoading } = useMissionaries();

  const filteredMissionaries = nameFilter
    ? missionaries?.filter((m) => m.name.includes(nameFilter))
    : missionaries;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">선교 목록</h1>
        <Link href="/missions/create">
          <Button color="primary">신규 선교 생성</Button>
        </Link>
      </div>

      <MissionListContent
        missionaries={filteredMissionaries}
        isLoading={isLoading}
      />
    </div>
  );
}
