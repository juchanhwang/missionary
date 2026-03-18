'use client';

import { SearchBox, Select } from '@samilhero/design-system';
import { ROLE_LABELS } from 'lib/constants/role';
import { useEffect, useRef, useState } from 'react';

import type { AuthProvider, UserRole, UserSearchType } from 'apis/user';

const SEARCH_TYPE_LABELS: Record<UserSearchType, string> = {
  name: '이름',
  loginId: '아이디',
  phone: '핸드폰번호',
};

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalKeyword(keyword);
  }, [keyword]);

  const handleKeywordInput = (value: string) => {
    setLocalKeyword(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onKeywordChange(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3 mb-5">
      <Select
        value={searchType}
        onChange={(value?: string | string[] | null) =>
          onSearchTypeChange(((value as string) || 'name') as UserSearchType)
        }
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
          placeholder={`${SEARCH_TYPE_LABELS[searchType]}(으)로 검색...`}
          onChange={handleKeywordInput}
          size="md"
        />
      </div>

      <Select
        value={role || null}
        onChange={(value?: string | string[] | null) =>
          onRoleChange(((value as string) ?? '') as UserRole | '')
        }
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
        onChange={(value?: string | string[] | null) =>
          onProviderChange(((value as string) ?? '') as AuthProvider | '')
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
        onChange={(value?: string | string[] | null) =>
          onBaptizedChange((value as string) ?? '')
        }
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
