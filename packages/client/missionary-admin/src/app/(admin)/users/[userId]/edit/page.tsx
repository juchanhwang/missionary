import { getServerUser } from 'apis/user.server';
import { notFound } from 'next/navigation';

import { UserEditForm } from './_components/UserEditForm';

interface UserEditPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { userId } = await params;

  const user = await getServerUser(userId);

  if (!user) {
    notFound();
  }

  return <UserEditForm user={user} />;
}
