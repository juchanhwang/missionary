'use client';

import { Tooltip } from '@samilhero/design-system';
import { Pencil, Trash2 } from 'lucide-react';

import type { MissionaryRegion } from 'apis/missionaryRegion';

interface MissionaryRegionTableProps {
  regions: MissionaryRegion[];
  isAdmin: boolean;
  onEdit: (region: MissionaryRegion) => void;
  onDelete: (region: MissionaryRegion) => void;
}

function formatAddress(region: MissionaryRegion) {
  if (!region.addressBasic && !region.addressDetail) return null;
  return { basic: region.addressBasic, detail: region.addressDetail };
}

export function MissionaryRegionTable({
  regions,
  isAdmin,
  onEdit,
  onDelete,
}: MissionaryRegionTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="w-[160px] px-4 py-3 text-left text-xs font-semibold text-gray-500">
              이름
            </th>
            <th className="w-[160px] px-4 py-3 text-left text-xs font-semibold text-gray-500">
              방문목적
            </th>
            <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold text-gray-500">
              목사명
            </th>
            <th className="w-[140px] px-4 py-3 text-left text-xs font-semibold text-gray-500">
              목사연락처
            </th>
            <th className="min-w-[280px] flex-1 px-4 py-3 text-left text-xs font-semibold text-gray-500">
              주소
            </th>
            {isAdmin && (
              <th className="w-[100px] px-4 py-3 text-center text-xs font-semibold text-gray-500">
                액션
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => {
            const address = formatAddress(region);
            return (
              <tr
                key={region.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="max-w-[160px] truncate px-4 py-3 text-sm font-medium text-gray-900">
                  <Tooltip text={region.name}>
                    <span className="block truncate">{region.name}</span>
                  </Tooltip>
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 text-sm text-gray-600">
                  {region.visitPurpose || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {region.pastorName || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {region.pastorPhone || '-'}
                </td>
                <td className="max-w-[280px] px-4 py-3 text-sm text-gray-600">
                  {address ? (
                    <div>
                      {address.basic && (
                        <p className="truncate">{address.basic}</p>
                      )}
                      {address.detail && (
                        <p className="truncate text-xs text-gray-400">
                          {address.detail}
                        </p>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        aria-label={`${region.name} 수정`}
                        onClick={() => onEdit(region)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`${region.name} 삭제`}
                        onClick={() => onDelete(region)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
