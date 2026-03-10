import { getServerUser } from 'apis/user.server';
import { notFound } from 'next/navigation';

import { UserEditPanel } from './_components/UserEditPanel';

interface PanelPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserEditPanelPage({ params }: PanelPageProps) {
  const { userId } = await params;

  const user = await getServerUser(userId);

  if (!user) {
    notFound();
  }

  return <UserEditPanel user={user} />;
}
