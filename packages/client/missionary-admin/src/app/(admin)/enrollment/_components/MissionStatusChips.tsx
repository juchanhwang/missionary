'use client';

import type { EnrollmentStatus } from 'apis/enrollment';

type StatusFilter = EnrollmentStatus | 'ALL';

interface MissionStatusChipsProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ENROLLMENT_OPENED', label: '모집 중' },
  { value: 'ENROLLMENT_CLOSED', label: '모집 마감' },
  { value: 'COMPLETED', label: '종료' },
];

export type { StatusFilter };

export function MissionStatusChips({
  value,
  onChange,
}: MissionStatusChipsProps) {
  return (
    <div className="flex gap-2">
      {STATUS_OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
