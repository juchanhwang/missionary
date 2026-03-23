'use client';

import { Button } from '@samilhero/design-system';
import { formatDate } from 'lib/utils/formatDate';
import { RotateCcw } from 'lucide-react';

import type { DeletedRegionListItem } from 'apis/missionaryRegion';

interface DeletedRegionTableProps {
  regions: DeletedRegionListItem[];
  isLoading: boolean;
  onRestore: (region: DeletedRegionListItem) => void;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }, (_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-4 py-3">
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-6 w-12 bg-gray-100 rounded animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

function formatAddress(region: DeletedRegionListItem): string {
  const parts = [region.addressBasic, region.addressDetail].filter(Boolean);
  return parts.join(' ') || '';
}

export function DeletedRegionTable({
  regions,
  isLoading,
  onRestore,
}: DeletedRegionTableProps) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-left min-w-[860px]">
        <caption className="sr-only">삭제된 연계지 목록</caption>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[130px]"
            >
              선교 그룹
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[140px]"
            >
              연계지
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[90px]"
            >
              목사명
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[120px]"
            >
              목사연락처
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              주소
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[100px]"
            >
              생성일
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[100px]"
            >
              수정일
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[150px]"
            >
              비고
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[100px]"
            >
              삭제일
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold text-gray-400 whitespace-nowrap w-[72px] text-center"
            >
              복구
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : regions.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-12 text-center text-sm text-gray-400"
              >
                삭제된 연계지가 없습니다
              </td>
            </tr>
          ) : (
            regions.map((region) => {
              const fullAddress = formatAddress(region);

              return (
                <tr
                  key={region.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                    {region.missionGroup?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {region.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                    {region.pastorName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                    {region.pastorPhone ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    <div
                      className="truncate max-w-[180px]"
                      title={fullAddress || undefined}
                    >
                      {fullAddress || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(region.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(region.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    <div
                      className="truncate max-w-[150px]"
                      title={region.note || undefined}
                    >
                      {region.note || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(region.deletedAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                      onClick={() => onRestore(region)}
                      aria-label={`${region.name} 복구`}
                    >
                      <RotateCcw size={11} />
                      복구
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
