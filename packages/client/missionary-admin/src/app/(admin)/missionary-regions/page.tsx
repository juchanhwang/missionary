import { Suspense } from 'react';

import { MissionaryRegionsPageClient } from './_components/MissionaryRegionsPageClient';

export default function MissionaryRegionsPage() {
  return (
    <Suspense>
      <MissionaryRegionsPageClient />
    </Suspense>
  );
}
