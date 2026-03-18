'use client';

import { Select } from '@samilhero/design-system';
import { useGetMissionaries } from 'hooks/missionary/useGetMissionaries';

import type { Missionary } from 'apis/missionary';

interface MissionarySelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export function MissionarySelect({ value, onChange }: MissionarySelectProps) {
  const { data: missionaries, isLoading } = useGetMissionaries();

  const selectedMissionary = missionaries?.find(
    (m: Missionary) => m.id === String(value),
  );

  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        선교
      </label>
      <div className="max-w-xs">
        <Select
          value={value !== null ? String(value) : null}
          onChange={(v?: string | string[] | null) => {
            const id = v ? Number(v as string) : null;
            onChange(id);
          }}
          size="md"
        >
          <Select.Trigger>
            {isLoading
              ? '불러오는 중...'
              : selectedMissionary
                ? selectedMissionary.name
                : '선교를 선택하세요'}
          </Select.Trigger>
          <Select.Options>
            {missionaries?.map((m: Missionary) => (
              <Select.Option key={m.id} item={String(m.id)}>
                {m.name}
              </Select.Option>
            ))}
          </Select.Options>
        </Select>
      </div>
    </div>
  );
}
