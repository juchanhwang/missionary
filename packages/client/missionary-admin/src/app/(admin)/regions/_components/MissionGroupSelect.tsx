'use client';

import { Select } from '@samilhero/design-system';
import { Lock } from 'lucide-react';

import { useGetMissionGroups } from '../_hooks/useGetMissionGroups';

const CATEGORY_LABELS: Record<string, string> = {
  DOMESTIC: '국내',
  ABROAD: '해외',
};

interface MissionGroupSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showLockIcon?: boolean;
  label?: string;
}

export function MissionGroupSelect({
  value,
  onChange,
  disabled,
  showLockIcon,
  label = '선교 그룹',
}: MissionGroupSelectProps) {
  const { data: groups = [] } = useGetMissionGroups();

  const selectedGroup = groups.find((g) => g.id === value);

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
        aria-label={disabled ? '선교 그룹 (변경 불가)' : undefined}
      >
        <span className="flex items-center gap-1.5">
          {showLockIcon && <Lock size={12} className="text-gray-400" />}
          {selectedGroup ? (
            <>
              {selectedGroup.name}
              <span className="text-gray-400 text-xs">
                ({CATEGORY_LABELS[selectedGroup.category]})
              </span>
            </>
          ) : (
            '전체'
          )}
        </span>
      </Select.Trigger>
      <Select.Options>
        {!disabled && <Select.Option item="">전체</Select.Option>}
        {groups.map((group) => (
          <Select.Option key={group.id} item={group.id}>
            <span className="flex items-center gap-1.5">
              {group.name}
              <span className="text-gray-400 text-xs">
                ({CATEGORY_LABELS[group.category]})
              </span>
            </span>
          </Select.Option>
        ))}
      </Select.Options>
    </Select>
  );
}
