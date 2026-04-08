'use client';

import { Button, InputField, Select } from '@samilhero/design-system';

import type { TeamFilterState } from './types';
import type { RegionListItem } from 'apis/missionaryRegion';

interface TeamFilterBarProps {
  filter: TeamFilterState;
  onFilterChange: (next: TeamFilterState) => void;
  regions: RegionListItem[];
  filteredCount: number;
  totalCount: number;
}

/**
 * 팀 관리 검색/필터 바. fe-plan v1.2 §3-1, §6-3, ui-spec §8-3.
 *
 * - 팀명 검색(부분일치) + 연계지 Select + 초기화 + 카운터.
 * - 입력값과 선택값은 상위(`TeamManagementSection`)가 보관한다 (controlled).
 * - 디바운스도 상위에서 수행한다 (본 컴포넌트는 값만 전달).
 * - 항상 마운트된다(필터 미적용 시에도 활성 상태 노출).
 */
export function TeamFilterBar({
  filter,
  onFilterChange,
  regions,
  filteredCount,
  totalCount,
}: TeamFilterBarProps) {
  const selectedRegion = regions.find((r) => r.id === filter.regionId);
  const isFilterActive = filter.query !== '' || filter.regionId !== '';

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, query: event.target.value });
  };

  const handleRegionChange = (value: string | null) => {
    onFilterChange({ ...filter, regionId: value ?? '' });
  };

  const handleReset = () => {
    onFilterChange({ query: '', regionId: '' });
  };

  return (
    <div
      data-testid="team-filter-bar"
      className="flex flex-row flex-wrap items-end gap-2"
    >
      <div className="flex-1 min-w-[200px] max-w-[320px]">
        <InputField
          label="팀 검색"
          placeholder="팀명으로 검색"
          value={filter.query}
          onChange={handleQueryChange}
          onClear={() => onFilterChange({ ...filter, query: '' })}
          data-testid="team-filter-query"
        />
      </div>

      <div className="w-[200px]">
        <Select
          value={filter.regionId || null}
          onChange={(value) => handleRegionChange(value as string | null)}
          label="연계지"
          size="md"
        >
          <Select.Trigger data-testid="team-filter-region-trigger">
            {selectedRegion ? (
              selectedRegion.name
            ) : (
              <span className="text-gray-400">전체</span>
            )}
          </Select.Trigger>
          <Select.Options>
            <Select.Option item="">전체</Select.Option>
            {regions.map((region) => (
              <Select.Option key={region.id} item={region.id}>
                {region.name}
              </Select.Option>
            ))}
          </Select.Options>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="md"
        onClick={handleReset}
        disabled={!isFilterActive}
        data-testid="team-filter-reset"
      >
        초기화
      </Button>

      <span
        data-testid="team-filter-counter"
        className="ml-auto text-xs text-gray-500 self-center"
      >
        {filteredCount}/{totalCount}팀 표시 중
      </span>
    </div>
  );
}
