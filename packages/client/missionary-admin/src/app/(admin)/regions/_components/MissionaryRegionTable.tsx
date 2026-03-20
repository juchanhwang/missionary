'use client';

import { Button } from '@samilhero/design-system';
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
  const colCount = isAdmin ? 8 : 7;

  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <tr key={i} className="border-b border-gray-200">
          {Array.from({ length: colCount }, (_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
            </td>
          ))}
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
      <table className="w-full text-left min-w-[1200px]">
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
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[100px]"
            >
              차수
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[140px]"
            >
              연계지
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap w-[120px]"
            >
              방문목적
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
          ) : (
            regions.map((region) => {
              const fullAddress = formatAddress(region);

              return (
                <tr
                  key={region.id}
                  className="border-b border-gray-200 last:border-b-0 transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3.5 text-sm text-gray-900 whitespace-nowrap">
                    {region.missionary.missionGroup?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {region.missionary.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {region.name}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {region.visitPurpose ?? '—'}
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
                      {region.addressBasic ?? '—'}
                      {region.addressDetail && (
                        <>
                          <br />
                          <span className="text-gray-400">
                            {region.addressDetail}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          color="neutral"
                          size="sm"
                          onClick={() => onEdit(region)}
                          aria-label={`${region.name} 수정`}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          color="neutral"
                          size="sm"
                          onClick={() => onDelete(region)}
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
