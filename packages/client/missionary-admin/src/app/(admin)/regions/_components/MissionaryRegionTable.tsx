'use client';

import { Button } from '@samilhero/design-system';
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

function SkeletonRows({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <tr key={i} className="border-b border-gray-200">
          <td className="px-5 py-3.5">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </td>
          {isAdmin && (
            <td className="px-5 py-3.5">
              <div className="flex items-center justify-center gap-1">
                <div className="h-7 w-7 bg-gray-100 rounded animate-pulse" />
                <div className="h-7 w-7 bg-gray-100 rounded animate-pulse" />
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}

function formatAddress(region: RegionListItem): string {
  const parts = [region.addressBasic, region.addressDetail].filter(Boolean);
  return parts.join(' ') || '';
}

export function MissionaryRegionTable({
  regions,
  isLoading,
  isAdmin,
  onEdit,
  onDelete,
}: MissionaryRegionTableProps) {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <table className="w-full text-left min-w-[900px]">
        <caption className="sr-only">연계지 목록</caption>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-200 bg-gray-50">
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[140px]"
            >
              선교 그룹
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[140px]"
            >
              연계지
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[100px]"
            >
              목사명
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[130px]"
            >
              목사연락처
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              주소
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[100px]"
            >
              생성일
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[100px]"
            >
              수정일
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[150px]"
            >
              비고
            </th>
            {isAdmin && (
              <th
                scope="col"
                className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[112px] text-center"
              >
                액션
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows isAdmin={isAdmin} />
          ) : regions.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 9 : 8}
                className="px-5 py-16 text-center text-sm text-gray-400"
              >
                조건에 맞는 연계지가 없습니다
              </td>
            </tr>
          ) : (
            regions.map((region) => {
              const fullAddress = formatAddress(region);

              return (
                <tr
                  key={region.id}
                  className={`border-b border-gray-200 last:border-b-0 transition-colors duration-150 ${isAdmin ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={isAdmin ? () => onEdit(region) : undefined}
                  onKeyDown={
                    isAdmin
                      ? (e: React.KeyboardEvent) => {
                          if (e.key === 'Enter') onEdit(region);
                        }
                      : undefined
                  }
                  tabIndex={isAdmin ? 0 : undefined}
                >
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {region.missionGroup?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {region.name}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {region.pastorName ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {region.pastorPhone ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    <div
                      className="truncate max-w-[200px]"
                      title={fullAddress || undefined}
                    >
                      {fullAddress || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(region.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(region.updatedAt)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    <div
                      className="truncate max-w-[150px]"
                      title={region.note || undefined}
                    >
                      {region.note || '—'}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          color="neutral"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onEdit(region);
                          }}
                          aria-label={`${region.name} 수정`}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          color="neutral"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onDelete(region);
                          }}
                          aria-label={`${region.name} 삭제`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
