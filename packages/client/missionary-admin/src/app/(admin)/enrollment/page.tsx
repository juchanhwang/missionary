import { getServerEnrollmentSummary } from 'apis/enrollment.server';

import { EnrollmentListPage } from './_components/EnrollmentListPage';

export default async function EnrollmentPage() {
  const initialData = await getServerEnrollmentSummary();

  return <EnrollmentListPage initialData={initialData} />;
}
