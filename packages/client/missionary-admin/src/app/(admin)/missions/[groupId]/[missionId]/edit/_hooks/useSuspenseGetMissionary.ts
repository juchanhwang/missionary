'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { missionaryApi } from 'apis/missionary';
import { queryKeys } from 'lib/queryKeys';

export function useSuspenseGetMissionary(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.missionaries.detail(id),
    queryFn: async () => {
      const response = await missionaryApi.getMissionary(id);
      return response.data;
    },
  });
}
