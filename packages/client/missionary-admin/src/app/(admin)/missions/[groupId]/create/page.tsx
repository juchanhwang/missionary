import { AsyncBoundary } from 'components/boundary';

import { CreateMissionForm } from './_components/CreateMissionForm';

export default function CreateMissionPage() {
  return (
    <AsyncBoundary>
      <CreateMissionForm />
    </AsyncBoundary>
  );
}
