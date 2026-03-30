'use client';

import { useDebouncedCallback } from 'hooks/useDebouncedCallback';
import { useRouter, useSearchParams } from 'next/navigation';

import type {
  AuthProvider,
  GetUsersParams,
  UserRole,
  UserSearchType,
} from 'apis/user';

export const PAGE_SIZE = 20;

const VALID_SEARCH_TYPES: UserSearchType[] = ['name', 'loginId', 'phone'];
const VALID_ROLES: UserRole[] = ['USER', 'ADMIN', 'STAFF'];
const VALID_PROVIDERS: AuthProvider[] = ['LOCAL', 'GOOGLE', 'KAKAO'];
const VALID_BAPTIZED = ['true', 'false'];

function parseSearchType(value: string | null): UserSearchType {
  if (VALID_SEARCH_TYPES.includes(value as UserSearchType)) {
    return value as UserSearchType;
  }
  return 'name';
}

function parseRole(value: string | null): UserRole | '' {
  if (VALID_ROLES.includes(value as UserRole)) {
    return value as UserRole;
  }
  return '';
}

function parseProvider(value: string | null): AuthProvider | '' {
  if (VALID_PROVIDERS.includes(value as AuthProvider)) {
    return value as AuthProvider;
  }
  return '';
}

function parseBaptized(value: string | null): string {
  if (value && VALID_BAPTIZED.includes(value)) {
    return value;
  }
  return '';
}

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

  const queryParams: GetUsersParams = {
    ...params,
    pageSize: PAGE_SIZE,
  };

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
