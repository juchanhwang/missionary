'use client';

import { useDebounce } from 'hooks/useDebounce';
import { useSearchParams } from 'next/navigation';
import { use, useState } from 'react';

import { EnrollmentSummaryCard } from './EnrollmentSummaryCard';
import { ParticipantPanelContainer } from './panel/ParticipantPanelContainer';
import { ParticipantTable } from './ParticipantTable';
import { useGetParticipations } from '../_hooks/useGetParticipations';

import type {
  EnrollmentMissionSummary,
  MissionEnrollmentSummary,
} from 'apis/enrollment';
import type {
  AttendanceOption,
  FormFieldDefinition,
  PaginatedParticipationsResponse,
} from 'apis/participation';

const PAGE_SIZE = 20;

interface EnrollmentDetailContentProps {
  mission: EnrollmentMissionSummary;
  participationsPromise: Promise<PaginatedParticipationsResponse>;
  enrollmentSummaryPromise: Promise<MissionEnrollmentSummary>;
  formFieldsPromise: Promise<FormFieldDefinition[]>;
  attendanceOptionsPromise: Promise<AttendanceOption[]>;
}

export function EnrollmentDetailContent({
  mission,
  participationsPromise,
  enrollmentSummaryPromise,
  formFieldsPromise,
  attendanceOptionsPromise,
}: EnrollmentDetailContentProps) {
  // 서버에서 내려준 promise를 use()로 unwrap.
  // 미해결 상태에서는 부모 Suspense boundary가 fallback을 표시한다.
  const initialParticipations = use(participationsPromise);
  const initialEnrollmentSummary = use(enrollmentSummaryPromise);
  const formFields = use(formFieldsPromise);
  const attendanceOptions = use(attendanceOptionsPromise);

  const searchParams = useSearchParams();

  // --- 공용 상태: Table(렌더)과 Panel(prev/next)이 함께 사용 ---
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const isPaidFilter = searchParams.get('isPaid') ?? '';
  const attendanceTypeFilter = searchParams.get('attendanceType') ?? '';
  const currentPage = Number(searchParams.get('page') ?? '1');

  const validAttendanceType =
    attendanceTypeFilter === 'FULL' || attendanceTypeFilter === 'PARTIAL'
      ? attendanceTypeFilter
      : undefined;

  const { data, isLoading } = useGetParticipations({
    params: {
      missionaryId: mission.id,
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
      isPaid:
        isPaidFilter === 'true'
          ? true
          : isPaidFilter === 'false'
            ? false
            : undefined,
      attendanceType: validAttendanceType,
      query: debouncedSearchQuery || undefined,
    },
    initialData: initialParticipations,
  });

  return (
    <>
      <EnrollmentSummaryCard
        missionaryId={mission.id}
        initialData={initialEnrollmentSummary}
      />

      <ParticipantTable
        data={data}
        isLoading={isLoading}
        formFields={formFields}
        missionaryId={mission.id}
        missionName={mission.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* SidePanel은 fixed positioned이므로 DOM 위치는 시각 layout과 무관 */}
      <ParticipantPanelContainer
        participants={data?.data ?? []}
        missionaryId={mission.id}
        missionName={mission.name}
        initialAttendanceOptions={attendanceOptions}
        formFields={formFields}
      />
    </>
  );
}
