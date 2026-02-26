import { toMissionPayload } from './toMissionPayload';
import { type MissionFormData } from '../_schemas/missionSchema';

function createFormData(
  overrides: Partial<MissionFormData> = {},
): MissionFormData {
  return {
    name: '1차 선교',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-15'),
    pastorName: '김목사',
    order: 1,
    ...overrides,
  };
}

describe('toMissionPayload', () => {
  it('필수 필드를 payload에 포함한다', () => {
    const payload = toMissionPayload(createFormData());

    expect(payload.name).toBe('1차 선교');
    expect(payload.pastorName).toBe('김목사');
    expect(payload.order).toBe(1);
  });

  it('날짜 필드를 ISO 문자열로 변환한다', () => {
    const payload = toMissionPayload(createFormData());

    expect(payload.startDate).toBe(new Date('2024-07-01').toISOString());
    expect(payload.endDate).toBe(new Date('2024-07-15').toISOString());
  });

  it('truthy인 선택 필드를 payload에 포함한다', () => {
    const payload = toMissionPayload(
      createFormData({
        description: '여름 단기선교',
        pastorPhone: '010-1234-5678',
        price: 500000,
        maximumParticipantCount: 30,
        bankName: '국민은행',
        bankAccountHolder: '삼일교회',
        bankAccountNumber: '000-000-000000',
        status: 'ENROLLMENT_OPENED',
        participationStartDate: new Date('2024-05-01'),
        participationEndDate: new Date('2024-06-30'),
      }),
    );

    expect(payload.description).toBe('여름 단기선교');
    expect(payload.pastorPhone).toBe('010-1234-5678');
    expect(payload.price).toBe(500000);
    expect(payload.maximumParticipantCount).toBe(30);
    expect(payload.bankName).toBe('국민은행');
    expect(payload.bankAccountHolder).toBe('삼일교회');
    expect(payload.bankAccountNumber).toBe('000-000-000000');
    expect(payload.status).toBe('ENROLLMENT_OPENED');
    expect(payload.participationStartDate).toBe(
      new Date('2024-05-01').toISOString(),
    );
    expect(payload.participationEndDate).toBe(
      new Date('2024-06-30').toISOString(),
    );
  });

  it('falsy인 선택 필드를 payload에서 제외한다', () => {
    const payload = toMissionPayload(
      createFormData({
        description: '',
        pastorPhone: '',
        price: undefined,
        maximumParticipantCount: undefined,
        bankName: '',
        bankAccountHolder: '',
        bankAccountNumber: '',
        status: undefined,
        participationStartDate: undefined,
        participationEndDate: undefined,
      }),
    );

    expect(payload).not.toHaveProperty('description');
    expect(payload).not.toHaveProperty('pastorPhone');
    expect(payload).not.toHaveProperty('price');
    expect(payload).not.toHaveProperty('maximumParticipantCount');
    expect(payload).not.toHaveProperty('bankName');
    expect(payload).not.toHaveProperty('bankAccountHolder');
    expect(payload).not.toHaveProperty('bankAccountNumber');
    expect(payload).not.toHaveProperty('status');
    expect(payload).not.toHaveProperty('participationStartDate');
    expect(payload).not.toHaveProperty('participationEndDate');
  });

  it('price가 0일 때 payload에 포함한다', () => {
    const payload = toMissionPayload(createFormData({ price: 0 }));

    expect(payload.price).toBe(0);
  });

  it('maximumParticipantCount가 0일 때 payload에 포함한다', () => {
    const payload = toMissionPayload(
      createFormData({ maximumParticipantCount: 0 }),
    );

    expect(payload.maximumParticipantCount).toBe(0);
  });
});
