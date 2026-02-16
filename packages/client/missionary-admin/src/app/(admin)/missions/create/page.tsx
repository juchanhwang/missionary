import { AsyncBoundary } from 'components/boundary';

import { CreateMissionGroupForm } from './_components/CreateMissionGroupForm';

export default function CreateMissionGroupPage() {
  return (
    <AsyncBoundary>
      <CreateMissionGroupForm />
    </AsyncBoundary>
  );
}
