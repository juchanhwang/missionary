'use client';

import { useDebounce } from 'hooks/useDebounce';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { EnrollmentDetailHeader } from './EnrollmentDetailHeader';
import { EnrollmentDetailTabs } from './EnrollmentDetailTabs';
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

interface EnrollmentDetailPageProps {
  mission: EnrollmentMissionSummary;
  initialParticipations: PaginatedParticipationsResponse;
  initialEnrollmentSummary: MissionEnrollmentSummary;
  formFields: FormFieldDefinition[];
  attendanceOptions: AttendanceOption[];
}

export function EnrollmentDetailPage({
  mission,
  initialParticipations,
  initialEnrollmentSummary,
  formFields,
  attendanceOptions,
}: EnrollmentDetailPageProps) {
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
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex flex-col flex-1 p-8 gap-5 min-h-0">
        <EnrollmentDetailHeader mission={mission} />

        <EnrollmentSummaryCard
          missionaryId={mission.id}
          initialData={initialEnrollmentSummary}
        />

        <EnrollmentDetailTabs>
          <EnrollmentDetailTabs.Participants>
            <ParticipantTable
              data={data}
              isLoading={isLoading}
              formFields={formFields}
              missionaryId={mission.id}
              missionName={mission.name}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </EnrollmentDetailTabs.Participants>
          <EnrollmentDetailTabs.Teams>
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              팀 관리는 전용 페이지로 이동했습니다.
            </div>
          </EnrollmentDetailTabs.Teams>
        </EnrollmentDetailTabs>
      </div>

      <ParticipantPanelContainer
        participants={data?.data ?? []}
        missionaryId={mission.id}
        missionName={mission.name}
        initialAttendanceOptions={attendanceOptions}
        formFields={formFields}
      />
    </div>
  );
}
