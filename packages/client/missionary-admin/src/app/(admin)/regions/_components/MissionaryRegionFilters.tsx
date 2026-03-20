'use client';

import { SearchBox } from '@samilhero/design-system';
import { useState } from 'react';

import { MissionarySelect } from './MissionarySelect';
import { MissionGroupSelect } from './MissionGroupSelect';

interface MissionaryRegionFiltersProps {
  query: string;
  missionGroupId: string;
  missionaryId: string;
  onQueryChange: (value: string) => void;
  onMissionGroupChange: (value: string) => void;
  onMissionaryChange: (value: string) => void;
}

export function MissionaryRegionFilters({
  query,
  missionGroupId,
  missionaryId,
  onQueryChange,
  onMissionGroupChange,
  onMissionaryChange,
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
    <div className="flex items-center gap-3 mb-5">
      <div className="flex-1 max-w-[360px]">
        <SearchBox
          value={localKeyword}
          placeholder="이름, 목사명으로 검색..."
          onChange={handleKeywordInput}
          size="md"
          aria-label="연계지 검색"
        />
      </div>

      <MissionGroupSelect
        value={missionGroupId}
        onChange={onMissionGroupChange}
      />

      <MissionarySelect
        value={missionaryId}
        missionGroupId={missionGroupId}
        onChange={onMissionaryChange}
      />
    </div>
  );
}
