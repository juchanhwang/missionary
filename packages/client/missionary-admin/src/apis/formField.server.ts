import { cache } from 'react';
import 'server-only';

import { createServerApi } from './serverInstance';

import type { FormFieldDefinition } from './participation';

export const getServerFormFields = cache(async (missionaryId: string) => {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<FormFieldDefinition[]>(
    `/missionaries/${missionaryId}/form-fields`,
  );
  return data;
});
