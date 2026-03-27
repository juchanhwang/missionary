import type { MissionaryAttendanceOption } from '../../../prisma/generated/prisma';

export interface AttendanceOptionCreateInput {
  missionaryId: string;
  type: 'FULL' | 'PARTIAL';
  label: string;
  order: number;
  createdBy?: string;
}

export interface AttendanceOptionUpdateInput {
  type?: 'FULL' | 'PARTIAL';
  label?: string;
  order?: number;
  updatedBy?: string;
}

export interface AttendanceOptionRepository {
  create(
    data: AttendanceOptionCreateInput,
  ): Promise<MissionaryAttendanceOption>;
  findByMissionary(missionaryId: string): Promise<MissionaryAttendanceOption[]>;
  findById(id: string): Promise<MissionaryAttendanceOption | null>;
  update(
    id: string,
    data: AttendanceOptionUpdateInput,
  ): Promise<MissionaryAttendanceOption>;
  delete(id: string): Promise<MissionaryAttendanceOption>;
  countParticipationsByOption(optionId: string): Promise<number>;
}

export const ATTENDANCE_OPTION_REPOSITORY = Symbol(
  'ATTENDANCE_OPTION_REPOSITORY',
);
