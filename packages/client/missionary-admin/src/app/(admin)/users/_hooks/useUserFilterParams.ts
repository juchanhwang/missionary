'use client';

import { useDebouncedCallback } from 'hooks/useDebouncedCallback';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  buildUserQueryParams,
  parseBaptized,
  parseProvider,
  parseRole,
  parseSearchType,
} from '../_utils/parseUserFilterParams';

import type { AuthProvider, UserRole, UserSearchType } from 'apis/user';

export { PAGE_SIZE } from '../_utils/parseUserFilterParams';

export interface UserFilterParams {
  searchType: UserSearchType;
  keyword: string;
  role: UserRole | '';
  provider: AuthProvider | '';
  isBaptized: string;
  page: number;
}

export function useUserFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params: UserFilterParams = {
    searchType: parseSearchType(searchParams.get('searchType')),
    keyword: searchParams.get('keyword') ?? '',
    role: parseRole(searchParams.get('role')),
    provider: parseProvider(searchParams.get('provider')),
    isBaptized: parseBaptized(searchParams.get('isBaptized')),
    page: Math.max(1, Number(searchParams.get('page')) || 1),
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  };

  const [debouncedSetKeyword, cancelKeywordDebounce] = useDebouncedCallback(
    (value: string) => {
      updateParams({ keyword: value || null, page: null });
    },
    300,
  );

  const setSearchType = (value: UserSearchType) => {
    cancelKeywordDebounce();
    updateParams({
      searchType: value === 'name' ? null : value,
      keyword: null,
      page: null,
    });
  };

  const clearKeyword = () => {
    cancelKeywordDebounce();
    updateParams({ keyword: null, page: null });
  };

  const setRole = (value: UserRole | '') => {
    updateParams({ role: value || null, page: null });
  };

  const setProvider = (value: AuthProvider | '') => {
    updateParams({ provider: value || null, page: null });
  };

  const setIsBaptized = (value: string) => {
    updateParams({ isBaptized: value || null, page: null });
  };

  const setPage = (page: number) => {
    updateParams({ page: page > 1 ? String(page) : null });
  };

  const queryParams = buildUserQueryParams({
    searchType: searchParams.get('searchType'),
    keyword: searchParams.get('keyword'),
    role: searchParams.get('role'),
    provider: searchParams.get('provider'),
    isBaptized: searchParams.get('isBaptized'),
    page: searchParams.get('page'),
  });

  return {
    params,
    queryParams,
    setSearchType,
    setKeyword: debouncedSetKeyword,
    clearKeyword,
    setRole,
    setProvider,
    setIsBaptized,
    setPage,
  };
}
