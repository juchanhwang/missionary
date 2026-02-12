import { AsyncBoundary } from 'components/boundary';

import { MissionaryEditForm } from './_components/MissionaryEditForm';

export default function EditMissionPage() {
  return (
    <AsyncBoundary>
      <MissionaryEditForm />
    </AsyncBoundary>
  );
}
