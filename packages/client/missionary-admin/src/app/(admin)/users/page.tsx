import { getServerUsers } from 'apis/user';

import { UsersPageClient } from './_components/UsersPageClient';

export default async function UsersPage() {
  const initialData = await getServerUsers({ page: 1, pageSize: 20 });

  return <UsersPageClient initialData={initialData} />;
}
