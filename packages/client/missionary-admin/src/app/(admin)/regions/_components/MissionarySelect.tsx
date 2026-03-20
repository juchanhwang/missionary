'use client';

import { Select } from '@samilhero/design-system';
import { Lock } from 'lucide-react';

import { useGetMissionaries } from '../_hooks/useGetMissionaries';

interface MissionarySelectProps {
  value: string;
  missionGroupId: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showLockIcon?: boolean;
  label?: string;
}

export function MissionarySelect({
  value,
  missionGroupId,
  onChange,
  disabled,
  showLockIcon,
  label = '차수',
}: MissionarySelectProps) {
  const { data: missionaries = [] } = useGetMissionaries({
    missionGroupId: missionGroupId || undefined,
  });

  const selectedMissionary = missionaries.find((m) => m.id === value);

  return (
    <Select
      value={value || null}
      onChange={(v?: string | string[] | null) =>
        onChange(((v as string) ?? '') as string)
      }
      label={label}
      size="md"
    >
      <Select.Trigger
        disabled={disabled}
        aria-label={disabled ? '차수 (변경 불가)' : undefined}
      >
        <span className="flex items-center gap-1.5">
          {showLockIcon && <Lock size={12} className="text-gray-400" />}
          {selectedMissionary ? selectedMissionary.name : '전체'}
        </span>
      </Select.Trigger>
      <Select.Options>
        {!disabled && <Select.Option item="">전체</Select.Option>}
        {missionaries.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-400">
            등록된 차수가 없습니다
          </div>
        ) : (
          missionaries.map((m) => (
            <Select.Option key={m.id} item={m.id}>
              {m.name}
            </Select.Option>
          ))
        )}
      </Select.Options>
    </Select>
  );
}
