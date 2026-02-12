import { AsyncBoundary } from 'components/boundary';

import { EditMissionGroupForm } from './_components/EditMissionGroupForm';

export default function EditMissionGroupPage() {
  return (
    <AsyncBoundary>
      <EditMissionGroupForm />
    </AsyncBoundary>
  );
}
