'use client';

import { SearchBox, Select } from '@samilhero/design-system';
import { ROLE_LABELS } from 'lib/constants/role';
import { useEffect, useState } from 'react';

import { getSelectValue } from '../_utils/getSelectValue';

import type { AuthProvider, UserRole, UserSearchType } from 'apis/user';

const SEARCH_TYPE_LABELS: Record<UserSearchType, string> = {
  name: '이름',
  loginId: '아이디',
  phone: '핸드폰번호',
};

function getParticleRo(word: string) {
  const lastChar = word.charCodeAt(word.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return '로';
  const jongseong = (lastChar - 0xac00) % 28;
  return jongseong === 0 || jongseong === 8 ? '로' : '으로';
}

const PROVIDER_LABELS: Record<string, string> = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  KAKAO: 'KAKAO',
};

const BAPTIZED_LABELS: Record<string, string> = {
  true: '받음',
  false: '안 받음',
};

interface UserSearchFilterProps {
  searchType: UserSearchType;
  keyword: string;
  role: UserRole | '';
  provider: AuthProvider | '';
  isBaptized: string;
  onSearchTypeChange: (value: UserSearchType) => void;
  onKeywordChange: (value: string) => void;
  onRoleChange: (value: UserRole | '') => void;
  onProviderChange: (value: AuthProvider | '') => void;
  onBaptizedChange: (value: string) => void;
}

export function UserSearchFilter({
  searchType,
  keyword,
  role,
  provider,
  isBaptized,
  onSearchTypeChange,
  onKeywordChange,
  onRoleChange,
  onProviderChange,
  onBaptizedChange,
}: UserSearchFilterProps) {
  const [localKeyword, setLocalKeyword] = useState(keyword);

  useEffect(() => {
    setLocalKeyword(keyword);
  }, [keyword]);

  const handleKeywordInput = (value: string) => {
    setLocalKeyword(value);
    onKeywordChange(value);
  };

  return (
    <div className="flex items-center gap-3 mb-5">
      <Select
        value={searchType}
        onChange={(value) => {
          const v = getSelectValue<UserSearchType>(value);
          if (v) onSearchTypeChange(v);
        }}
        size="md"
      >
        <Select.Trigger>{SEARCH_TYPE_LABELS[searchType]}</Select.Trigger>
        <Select.Options>
          {Object.entries(SEARCH_TYPE_LABELS).map(([value, label]) => (
            <Select.Option key={value} item={value}>
              {label}
            </Select.Option>
          ))}
        </Select.Options>
      </Select>

      <div className="flex-1 max-w-md">
        <SearchBox
          value={localKeyword}
          placeholder={`${SEARCH_TYPE_LABELS[searchType]}${getParticleRo(SEARCH_TYPE_LABELS[searchType])} 검색...`}
          onChange={handleKeywordInput}
          size="md"
        />
      </div>

      <Select
        value={role || null}
        onChange={(value) => onRoleChange(getSelectValue<UserRole>(value))}
        size="md"
      >
        <Select.Trigger>
          {role ? ROLE_LABELS[role] : '전체 역할'}
        </Select.Trigger>
        <Select.Options>
          <Select.Option item="">전체 역할</Select.Option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <Select.Option key={value} item={value}>
              {label}
            </Select.Option>
          ))}
        </Select.Options>
      </Select>

      <Select
        value={provider || null}
        onChange={(value) =>
          onProviderChange(getSelectValue<AuthProvider>(value))
        }
        size="md"
      >
        <Select.Trigger>
          {provider ? PROVIDER_LABELS[provider] : '전체 인증방식'}
        </Select.Trigger>
        <Select.Options>
          <Select.Option item="">전체 인증방식</Select.Option>
          <Select.Option item="LOCAL">LOCAL</Select.Option>
          <Select.Option item="GOOGLE">GOOGLE</Select.Option>
          <Select.Option item="KAKAO">KAKAO</Select.Option>
        </Select.Options>
      </Select>

      <Select
        value={isBaptized || null}
        onChange={(value) => onBaptizedChange(getSelectValue(value))}
        size="md"
      >
        <Select.Trigger>
          {isBaptized ? BAPTIZED_LABELS[isBaptized] : '세례 여부'}
        </Select.Trigger>
        <Select.Options>
          <Select.Option item="">세례 여부</Select.Option>
          <Select.Option item="true">받음</Select.Option>
          <Select.Option item="false">안 받음</Select.Option>
        </Select.Options>
      </Select>
    </div>
  );
}
