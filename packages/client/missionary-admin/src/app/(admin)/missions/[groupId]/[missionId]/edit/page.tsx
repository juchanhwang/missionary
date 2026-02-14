import { type Missionary } from 'apis/missionary';
import { createServerApi } from 'apis/serverInstance';
import { notFound } from 'next/navigation';

import { MissionaryEditForm } from './_components/MissionaryEditForm';

interface EditMissionPageProps {
  params: Promise<{ groupId: string; missionId: string }>;
}

export default async function EditMissionPage({
  params,
}: EditMissionPageProps) {
  const { missionId } = await params;

  const api = await createServerApi();
  const { data: missionary } = await api.get<Missionary>(
    `/missionaries/${missionId}`,
  );

  if (!missionary) {
    notFound();
  }

  return <MissionaryEditForm missionary={missionary} />;
}
