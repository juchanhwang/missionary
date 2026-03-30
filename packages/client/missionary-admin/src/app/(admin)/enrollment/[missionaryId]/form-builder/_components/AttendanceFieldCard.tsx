'use client';

import { ChevronDown, Circle, Lock, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  useCreateAttendanceOption,
  useDeleteAttendanceOption,
  useUpdateAttendanceOption,
} from '../_hooks/useAttendanceOptionMutations';

import type { AttendanceOption } from 'apis/participation';

const TYPE_BADGE: Record<string, string> = {
  FULL: 'bg-blue-10 text-blue-60',
  PARTIAL: 'bg-amber-50 text-amber-700',
};

interface OptionItemProps {
  option: AttendanceOption;
  onUpdate: (label: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
  isDeletable: boolean;
}

function OptionItem({
  option,
  onUpdate,
  onDelete,
  isDeleting,
  isDeletable,
}: OptionItemProps) {
  const [localLabel, setLocalLabel] = useState(option.label);
  const prevLabelRef = useRef(option.label);

  const handleBlur = () => {
    const trimmed = localLabel.trim();
    if (trimmed && trimmed !== prevLabelRef.current) {
      onUpdate(trimmed);
      prevLabelRef.current = trimmed;
    } else {
      setLocalLabel(prevLabelRef.current);
    }
  };

  return (
    <div className="group flex items-center gap-2 py-1">
      <Circle size={16} className="shrink-0 text-gray-300" />
      <input
        type="text"
        value={localLabel}
        onChange={(e) => setLocalLabel(e.target.value)}
        onBlur={handleBlur}
        className="flex-1 min-w-0 text-sm text-gray-700 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 outline-none py-0.5 px-0.5 transition-colors"
      />
      <span
        className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_BADGE[option.type] ?? 'bg-gray-100 text-gray-500'}`}
      >
        {option.type === 'FULL' ? '전체' : '부분'}
      </span>
      {isDeletable && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="shrink-0 p-1 rounded text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
          aria-label={`${option.label} 삭제`}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

interface AttendanceFieldCardProps {
  missionaryId: string;
  attendanceOptions: AttendanceOption[];
}

export function AttendanceFieldCard({
  missionaryId,
  attendanceOptions,
}: AttendanceFieldCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const createOption = useCreateAttendanceOption(missionaryId);
  const updateOption = useUpdateAttendanceOption(missionaryId);
  const deleteOption = useDeleteAttendanceOption(missionaryId);

  const handleAddPartial = () => {
    createOption.mutate({
      type: 'PARTIAL',
      label: '부분 참석',
      order: attendanceOptions.length,
    });
  };

  const handleUpdate = (optionId: string, label: string) => {
    updateOption.mutate({ optionId, data: { label } });
  };

  const handleDelete = (optionId: string) => {
    deleteOption.mutate(optionId);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* 헤더 (클릭으로 토글) */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">참석 일정</span>
          <span className="text-red-600 font-bold text-sm">*</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            <Lock size={9} />
            고정
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border bg-blue-10 text-blue-60 border-blue-60">
            SELECT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            옵션 {attendanceOptions.length}개
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* 옵션 관리 영역 */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            {attendanceOptions.map((option) => (
              <OptionItem
                key={option.id}
                option={option}
                onUpdate={(label) => handleUpdate(option.id, label)}
                onDelete={() => handleDelete(option.id)}
                isDeleting={deleteOption.isPending}
                isDeletable={option.type !== 'FULL'}
              />
            ))}
          </div>

          {attendanceOptions.length === 0 && (
            <p className="text-xs text-gray-400 py-2">
              참석 옵션이 없습니다. 아래 버튼으로 추가하세요.
            </p>
          )}

          {/* 부분 참석 추가 버튼 */}
          <div className="mt-2 pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={handleAddPartial}
              disabled={createOption.isPending}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
            >
              <Plus size={13} />
              <span>부분 참석 추가</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
