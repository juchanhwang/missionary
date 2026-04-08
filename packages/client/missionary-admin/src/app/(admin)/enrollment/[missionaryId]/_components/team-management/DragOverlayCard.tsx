'use client';

import type { Participation } from 'apis/participation';

interface DragOverlayCardProps {
  participation: Participation;
}

/**
 * `DragOverlay` 내부에 렌더되는 임시 카드. ui-spec §4-4 유지.
 *
 * 드래그 중 실제 카드는 opacity-30으로 반투명 처리되고, 이 overlay는
 * rotate-2 tilt로 포인터에 고정되어 구분된다.
 *
 * `KanbanBoard`에서 `DragOverlay` 슬롯에 주입된다.
 */
export function DragOverlayCard({ participation }: DragOverlayCardProps) {
  return (
    <div
      data-testid="drag-overlay-card"
      className="flex items-start gap-2 bg-white border border-gray-300 rounded-lg px-2.5 py-2 shadow-lg rotate-2 w-[200px]"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {participation.name}
        </p>
      </div>
    </div>
  );
}
