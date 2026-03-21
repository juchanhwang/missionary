'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const ITEMS_PER_PAGE = 20;

export interface RegionFilterParams {
  query: string;
  missionGroupId: string;
  page: number;
}

export function useRegionFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const params: RegionFilterParams = {
    query: searchParams.get('query') ?? '',
    missionGroupId: searchParams.get('missionGroupId') ?? '',
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

  const setMissionGroupId = (value: string) => {
    updateParams({
      missionGroupId: value || null,
      page: null,
    });
  };

  const setQuery = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({
        query: value || null,
        page: null,
      });
    }, 300);
  };

  const setPage = (page: number) => {
    updateParams({ page: page > 1 ? String(page) : null });
  };

  const clearQuery = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateParams({ query: null, page: null });
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    params,
    setQuery,
    setMissionGroupId,
    setPage,
    clearQuery,
  };
}
