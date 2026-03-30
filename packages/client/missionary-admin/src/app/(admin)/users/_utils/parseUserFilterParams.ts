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

export function parseSearchType(value: string | null): UserSearchType {
  if (VALID_SEARCH_TYPES.includes(value as UserSearchType)) {
    return value as UserSearchType;
  }
  return 'name';
}

export function parseRole(value: string | null): UserRole | '' {
  if (VALID_ROLES.includes(value as UserRole)) {
    return value as UserRole;
  }
  return '';
}

export function parseProvider(value: string | null): AuthProvider | '' {
  if (VALID_PROVIDERS.includes(value as AuthProvider)) {
    return value as AuthProvider;
  }
  return '';
}

export function parseBaptized(value: string | null): string {
  if (value && VALID_BAPTIZED.includes(value)) {
    return value;
  }
  return '';
}

/**
 * URL searchParams 원시 값으로부터 API 쿼리 파라미터를 생성한다.
 * 서버(page.tsx prefetch)와 클라이언트(useUserFilterParams)에서
 * 동일한 queryKey를 생성하기 위해 공유한다.
 */
export function buildUserQueryParams(raw: {
  searchType?: string | null;
  keyword?: string | null;
  role?: string | null;
  provider?: string | null;
  isBaptized?: string | null;
  page?: string | null;
}): GetUsersParams {
  return {
    searchType: parseSearchType(raw.searchType ?? null),
    keyword: raw.keyword ?? '',
    role: parseRole(raw.role ?? null),
    provider: parseProvider(raw.provider ?? null),
    isBaptized: parseBaptized(raw.isBaptized ?? null),
    page: Math.max(1, Number(raw.page) || 1),
    pageSize: PAGE_SIZE,
  };
}
