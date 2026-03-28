import { getServerEnrollmentSummary } from 'apis/enrollment.server';

import { FormBuilderPage } from './_components/FormBuilderPage';

interface FormBuilderRouteParams {
  params: Promise<{ missionaryId: string }>;
}

export default async function FormBuilderRoute({
  params,
}: FormBuilderRouteParams) {
  const { missionaryId } = await params;
  const summaryData = await getServerEnrollmentSummary();
  const mission = summaryData.missions.find((m) => m.id === missionaryId);

  if (!mission) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">선교를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return <FormBuilderPage mission={mission} />;
}
