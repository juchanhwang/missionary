'use client';

import { MISSION_STATUS_LABEL } from '../../missions/_utils/missionStatus';

import type { EnrollmentStatus } from 'apis/enrollment';

type StatusFilter = EnrollmentStatus | 'ALL';

interface MissionStatusChipsProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  ...Object.entries(MISSION_STATUS_LABEL).map(([value, label]) => ({
    value: value as StatusFilter,
    label,
  })),
];

export type { StatusFilter };

export function MissionStatusChips({
  value,
  onChange,
}: MissionStatusChipsProps) {
  return (
    <div className="flex gap-1.5">
      {STATUS_OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
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
