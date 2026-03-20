'use client';

import { SearchBox } from '@samilhero/design-system';
import { useState } from 'react';

import { MissionGroupSelect } from './MissionGroupSelect';

interface MissionaryRegionFiltersProps {
  query: string;
  missionGroupId: string;
  onQueryChange: (value: string) => void;
  onMissionGroupChange: (value: string) => void;
  searchLabel?: string;
}

export function MissionaryRegionFilters({
  query,
  missionGroupId,
  onQueryChange,
  onMissionGroupChange,
  searchLabel = '연계지 검색',
}: MissionaryRegionFiltersProps) {
  const [localKeyword, setLocalKeyword] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);

  if (prevQuery !== query) {
    setPrevQuery(query);
    setLocalKeyword(query);
  }

  const handleKeywordInput = (value: string) => {
    setLocalKeyword(value);
    onQueryChange(value);
  };

  return (
    <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
      <div className="flex-1 max-w-[280px]">
        <SearchBox
          value={localKeyword}
          placeholder="이름, 목사명으로 검색..."
          onChange={handleKeywordInput}
          size="sm"
          aria-label={searchLabel}
        />
      </div>

      <div className="w-px h-[18px] bg-gray-200" />

      <div className="min-w-[140px]">
        <MissionGroupSelect
          value={missionGroupId}
          onChange={onMissionGroupChange}
          label=""
          size="sm"
          placeholder="선교 그룹 전체"
        />
      </div>
    </div>
  );
}
