import { describe, it, expect } from 'vitest';

import { missionSchema } from '../missionSchema';

describe('missionSchema', () => {
  it('유효한 데이터를 통과시킨다', () => {
    const validData = {
      name: '2024 여름 단기선교',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      pastorName: '김목사',
      regionId: 'region-1',
      participationStartDate: new Date('2024-05-01'),
      participationEndDate: new Date('2024-06-30'),
    };

    const result = missionSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
      expect(result.data.startDate).toBeInstanceOf(Date);
      expect(result.data.endDate).toBeInstanceOf(Date);
      expect(result.data.participationStartDate).toBeInstanceOf(Date);
      expect(result.data.participationEndDate).toBeInstanceOf(Date);
    }
  });

  it('빈 선교 이름을 거부하고 에러 메시지를 반환한다', () => {
    const invalidData = {
      name: '',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      pastorName: '김목사',
      regionId: 'region-1',
      participationStartDate: new Date('2024-05-01'),
      participationEndDate: new Date('2024-06-30'),
    };

    const result = missionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('선교 이름을 입력해주세요');
    }
  });

  it('선교 시작일이 없으면 에러 메시지를 반환한다', () => {
    const invalidData = {
      name: '2024 여름 단기선교',
      endDate: new Date('2024-07-15'),
      pastorName: '김목사',
      regionId: 'region-1',
      participationStartDate: new Date('2024-05-01'),
      participationEndDate: new Date('2024-06-30'),
    };

    const result = missionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.find((issue) => issue.path[0] === 'startDate')
          ?.message,
      ).toBe('선교 시작일을 선택해주세요');
    }
  });

  it('선교 종료일이 없으면 에러 메시지를 반환한다', () => {
    const invalidData = {
      name: '2024 여름 단기선교',
      startDate: new Date('2024-07-01'),
      pastorName: '김목사',
      regionId: 'region-1',
      participationStartDate: new Date('2024-05-01'),
      participationEndDate: new Date('2024-06-30'),
    };

    const result = missionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.find((issue) => issue.path[0] === 'endDate')
          ?.message,
      ).toBe('선교 종료일을 선택해주세요');
    }
  });

  it('빈 담당 교역자를 거부하고 에러 메시지를 반환한다', () => {
    const invalidData = {
      name: '2024 여름 단기선교',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      pastorName: '',
      regionId: 'region-1',
      participationStartDate: new Date('2024-05-01'),
      participationEndDate: new Date('2024-06-30'),
    };

    const result = missionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('담당 교역자를 입력해주세요');
    }
  });

  it('빈 지역을 거부하고 에러 메시지를 반환한다', () => {
    const invalidData = {
      name: '2024 여름 단기선교',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      pastorName: '김목사',
      regionId: '',
      participationStartDate: new Date('2024-05-01'),
      participationEndDate: new Date('2024-06-30'),
    };

    const result = missionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('지역을 선택해주세요');
    }
  });

  it('참가 신청 시작일이 없으면 에러 메시지를 반환한다', () => {
    const invalidData = {
      name: '2024 여름 단기선교',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      pastorName: '김목사',
      regionId: 'region-1',
      participationEndDate: new Date('2024-06-30'),
    };

    const result = missionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.find(
          (issue) => issue.path[0] === 'participationStartDate',
        )?.message,
      ).toBe('참가 신청 시작일을 선택해주세요');
    }
  });

  it('참가 신청 종료일이 없으면 에러 메시지를 반환한다', () => {
    const invalidData = {
      name: '2024 여름 단기선교',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      pastorName: '김목사',
      regionId: 'region-1',
      participationStartDate: new Date('2024-05-01'),
    };

    const result = missionSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.find(
          (issue) => issue.path[0] === 'participationEndDate',
        )?.message,
      ).toBe('참가 신청 종료일을 선택해주세요');
    }
  });

  it('날짜 필드가 Date 객체로 유지된다', () => {
    const validData = {
      name: '2024 여름 단기선교',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      pastorName: '김목사',
      regionId: 'region-1',
      participationStartDate: new Date('2024-05-01'),
      participationEndDate: new Date('2024-06-30'),
    };

    const result = missionSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeInstanceOf(Date);
      expect(result.data.endDate).toBeInstanceOf(Date);
      expect(result.data.participationStartDate).toBeInstanceOf(Date);
      expect(result.data.participationEndDate).toBeInstanceOf(Date);
      expect(typeof result.data.startDate.getTime()).toBe('number');
      expect(typeof result.data.endDate.getTime()).toBe('number');
      expect(typeof result.data.participationStartDate?.getTime()).toBe(
        'number',
      );
      expect(typeof result.data.participationEndDate?.getTime()).toBe('number');
    }
  });
});
