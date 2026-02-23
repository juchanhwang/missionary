import { type MissionGroupDetail } from 'apis/missionGroup';
import { createServerApi } from 'apis/serverInstance';
import { notFound } from 'next/navigation';

import { MissionGroupDetail as MissionGroupDetailView } from './_components/MissionGroupDetail';

interface MissionGroupDetailPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function MissionGroupDetailPage({
  params,
}: MissionGroupDetailPageProps) {
  const { groupId } = await params;

  const api = await createServerApi();
  const { data: group } = await api.get<MissionGroupDetail>(
    `/mission-groups/${groupId}`,
  );

  if (!group) {
    notFound();
  }

  return <MissionGroupDetailView group={group} />;
}
