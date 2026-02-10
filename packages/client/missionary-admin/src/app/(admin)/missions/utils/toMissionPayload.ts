import { type MissionFormData } from '../schemas/missionSchema';

export function toMissionPayload(data: MissionFormData) {
  return {
    name: data.name,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    pastorName: data.pastorName,
    regionId: data.regionId,
    participationStartDate: data.participationStartDate.toISOString(),
    participationEndDate: data.participationEndDate.toISOString(),
  };
}
