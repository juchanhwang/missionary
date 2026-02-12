import { type MissionFormData } from '../_schemas/missionSchema';

export function toMissionPayload(data: MissionFormData) {
  return {
    name: data.name,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    pastorName: data.pastorName,
    ...(data.pastorPhone && { pastorPhone: data.pastorPhone }),
    ...(data.participationStartDate && {
      participationStartDate: data.participationStartDate.toISOString(),
    }),
    ...(data.participationEndDate && {
      participationEndDate: data.participationEndDate.toISOString(),
    }),
    ...(data.price != null && { price: data.price }),
    ...(data.description && { description: data.description }),
    ...(data.maximumParticipantCount != null && {
      maximumParticipantCount: data.maximumParticipantCount,
    }),
    ...(data.bankName && { bankName: data.bankName }),
    ...(data.bankAccountHolder && {
      bankAccountHolder: data.bankAccountHolder,
    }),
    ...(data.bankAccountNumber && {
      bankAccountNumber: data.bankAccountNumber,
    }),
    ...(data.status && { status: data.status }),
    order: data.order,
  };
}
