import { type MissionFormData } from '../_schemas/missionSchema';

export function toMissionPayload(data: MissionFormData) {
  return {
    name: data.name,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    pastorName: data.pastorName,
    ...(data.participationStartDate && {
      participationStartDate: data.participationStartDate.toISOString(),
    }),
    ...(data.participationEndDate && {
      participationEndDate: data.participationEndDate.toISOString(),
    }),
    order: data.order,
  };
}
