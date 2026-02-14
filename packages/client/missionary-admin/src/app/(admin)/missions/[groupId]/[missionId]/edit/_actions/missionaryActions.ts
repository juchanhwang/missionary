'use server';

import { type UpdateMissionaryPayload } from 'apis/missionary';
import { createServerApi } from 'apis/serverInstance';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateMissionaryAction(
  id: string,
  missionGroupId: string,
  payload: UpdateMissionaryPayload,
) {
  const api = await createServerApi();
  await api.patch(`/missionaries/${id}`, payload);
  revalidatePath(`/missions/${missionGroupId}`);
  redirect(`/missions/${missionGroupId}`);
}

export async function deleteMissionaryAction(
  id: string,
  missionGroupId: string,
) {
  const api = await createServerApi();
  await api.delete(`/missionaries/${id}`);
  revalidatePath(`/missions/${missionGroupId}`);
  redirect(`/missions/${missionGroupId}`);
}
