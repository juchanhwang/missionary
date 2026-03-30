'use client';

import { FormBuilderSection } from './FormBuilderSection';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

interface FormBuilderPageProps {
  mission: EnrollmentMissionSummary;
}

export function FormBuilderPage({ mission }: FormBuilderPageProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-y-auto">
      <FormBuilderSection mission={mission} />
    </div>
  );
}
