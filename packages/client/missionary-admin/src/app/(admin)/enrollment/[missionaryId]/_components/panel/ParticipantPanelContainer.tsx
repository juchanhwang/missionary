'use client';

import { useState } from 'react';

import { ParticipantPanel } from './ParticipantPanel';
import { useEnrollmentUrl } from '../../_hooks/useEnrollmentUrl';
import { useGetAttendanceOptions } from '../../_hooks/useGetAttendanceOptions';

import type {
  AttendanceOption,
  FormFieldDefinition,
  Participation,
} from 'apis/participation';

interface ParticipantPanelContainerProps {
  participants: Participation[];
  missionaryId: string;
  missionName: string;
  initialAttendanceOptions: AttendanceOption[];
  formFields: FormFieldDefinition[];
}

export function ParticipantPanelContainer({
  participants,
  missionaryId,
  missionName,
  initialAttendanceOptions,
  formFields,
}: ParticipantPanelContainerProps) {
  const { searchParams, updateSearchParams } = useEnrollmentUrl();
  const selectedParticipantId = searchParams.get('participantId');

  // 패널 마운트 상태 (닫힘 애니메이션 동안 유지, 렌더 시점 조건부 업데이트)
  const [mountedParticipantId, setMountedParticipantId] = useState<
    string | null
  >(null);

  if (selectedParticipantId && selectedParticipantId !== mountedParticipantId) {
    setMountedParticipantId(selectedParticipantId);
  }

  // 참석 옵션 (클라이언트 갱신용)
  const { data: attendanceOptions = initialAttendanceOptions } =
    useGetAttendanceOptions({
      missionaryId,
      initialData: initialAttendanceOptions,
    });

  const handleClose = () => {
    updateSearchParams({ participantId: '' });
  };

  const handleExited = () => {
    setMountedParticipantId(null);
  };

  const handleNavigate = (id: string) => {
    updateSearchParams({ participantId: id });
  };

  if (!mountedParticipantId) return null;

  return (
    <ParticipantPanel
      key={mountedParticipantId}
      participantId={mountedParticipantId}
      participants={participants}
      attendanceOptions={attendanceOptions}
      formFields={formFields}
      missionName={missionName}
      isOpen={!!selectedParticipantId}
      onClose={handleClose}
      onExited={handleExited}
      onNavigate={handleNavigate}
    />
  );
}
