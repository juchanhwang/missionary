import { ConflictException, NotFoundException } from '@nestjs/common';

import { makeMissionaryAttendanceOption } from '@/testing/factories/attendance-option.factory';
import { makeMissionary } from '@/testing/factories/missionary.factory';
import { makeUser } from '@/testing/factories/user.factory';
import { FakeAttendanceOptionRepository } from '@/testing/fakes/fake-attendance-option.repository';
import { FakeMissionaryRepository } from '@/testing/fakes/fake-missionary.repository';
import { FakeParticipationRepository } from '@/testing/fakes/fake-participation.repository';

import { ParticipationProcessor } from './participation.processor';

import type { CreateParticipationDto } from './dto/create-participation.dto';
import type { Job } from 'bullmq';

describe('ParticipationProcessor', () => {
  let processor: ParticipationProcessor;
  let fakeMissionaryRepo: FakeMissionaryRepository;
  let fakeParticipationRepo: FakeParticipationRepository;
  let fakeAttendanceOptionRepo: FakeAttendanceOptionRepository;
  let mockEncryptionService: { encrypt: jest.Mock; decrypt: jest.Mock };

  const missionaryId = 'missionary-1';
  const userId = 'user-1';
  const attendanceOptionId = 'option-1';

  const makeDto = (
    overrides: Partial<CreateParticipationDto> = {},
  ): CreateParticipationDto => ({
    missionaryId,
    name: '홍길동',
    birthDate: '1990-01-01',
    applyFee: 10000,
    identificationNumber: '900101-1234567',
    isOwnCar: false,
    affiliation: '서울교회',
    attendanceOptionId,
    cohort: 1,
    ...overrides,
  });

  const makeJob = (dto: CreateParticipationDto, jobUserId: string = userId) =>
    ({
      data: { dto, userId: jobUserId },
    }) as Job<{ dto: CreateParticipationDto; userId: string }>;

  beforeEach(async () => {
    fakeMissionaryRepo = new FakeMissionaryRepository();
    fakeParticipationRepo = new FakeParticipationRepository();
    fakeAttendanceOptionRepo = new FakeAttendanceOptionRepository();
    mockEncryptionService = {
      encrypt: jest.fn((v: string) => `encrypted-${v}`),
      decrypt: jest.fn((v: string) => v.replace('encrypted-', '')),
    };

    processor = new ParticipationProcessor(
      fakeParticipationRepo as any,
      fakeMissionaryRepo as any,
      fakeAttendanceOptionRepo as any,
      mockEncryptionService as any,
    );
  });

  afterEach(() => {
    fakeMissionaryRepo.clear();
    fakeParticipationRepo.clear();
    fakeAttendanceOptionRepo.clear();
  });

  /**
   * 공통 셋업: missionary, user, attendanceOption 을 모든 fake store에 등록
   */
  async function setupMissionary(
    overrides: Partial<ReturnType<typeof makeMissionary>> = {},
  ) {
    const missionary = makeMissionary({
      id: missionaryId,
      maximumParticipantCount: 1,
      status: 'ENROLLMENT_OPENED',
      ...overrides,
    });

    await fakeMissionaryRepo.create({
      id: missionaryId,
      name: missionary.name,
      startDate: missionary.startDate,
      endDate: missionary.endDate,
      maximumParticipantCount: missionary.maximumParticipantCount,
      createdById: missionary.createdById,
      status: missionary.status,
    });

    const user = makeUser({ id: userId });
    const option = makeMissionaryAttendanceOption({
      id: attendanceOptionId,
      missionaryId,
    });

    fakeParticipationRepo.setMissionary(missionaryId, missionary);
    fakeParticipationRepo.setUser(userId, user);
    fakeAttendanceOptionRepo['store'].set(option.id, option);

    return { missionary, user, option };
  }

  describe('정원 도달 시 자동 모집 종료', () => {
    it('정원 도달 시 선교 상태가 ENROLLMENT_CLOSED로 자동 변경된다', async () => {
      // 정원 1명, 현재 0명 → 1명 등록으로 정원 도달
      await setupMissionary({ maximumParticipantCount: 1 });

      await processor.process(makeJob(makeDto()));

      const updated = await fakeMissionaryRepo.findWithDetails(missionaryId);
      expect(updated?.status).toBe('ENROLLMENT_CLOSED');
    });

    it('이미 ENROLLMENT_CLOSED인 경우 중복 업데이트하지 않는다', async () => {
      await setupMissionary({
        maximumParticipantCount: 1,
        status: 'ENROLLMENT_CLOSED',
      });

      const updateSpy = jest.spyOn(fakeMissionaryRepo, 'update');

      await processor.process(makeJob(makeDto()));

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('정원 미도달 시 상태가 변경되지 않는다', async () => {
      // 정원 10명, 현재 0명 → 1명 등록해도 정원 미도달
      await setupMissionary({ maximumParticipantCount: 10 });

      await processor.process(makeJob(makeDto()));

      const updated = await fakeMissionaryRepo.findWithDetails(missionaryId);
      expect(updated?.status).toBe('ENROLLMENT_OPENED');
    });

    it('maximumParticipantCount가 null이면 상태가 변경되지 않는다', async () => {
      await setupMissionary({ maximumParticipantCount: null });

      await processor.process(makeJob(makeDto()));

      const updated = await fakeMissionaryRepo.findWithDetails(missionaryId);
      expect(updated?.status).toBe('ENROLLMENT_OPENED');
    });
  });

  describe('기존 검증 로직', () => {
    it('존재하지 않는 선교로 등록하면 NotFoundException을 던진다', async () => {
      const dto = makeDto({ missionaryId: 'non-existent' });

      await expect(processor.process(makeJob(dto))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('정원이 이미 찬 선교에 등록하면 ConflictException을 던진다', async () => {
      const missionary = makeMissionary({
        id: missionaryId,
        maximumParticipantCount: 1,
        currentParticipantCount: 1,
      });

      await fakeMissionaryRepo.create({
        id: missionaryId,
        name: missionary.name,
        startDate: missionary.startDate,
        endDate: missionary.endDate,
        maximumParticipantCount: 1,
        createdById: missionary.createdById,
      });

      // FakeMissionaryRepo.create()은 currentParticipantCount를 0으로 설정하므로
      // update로 1로 변경
      await fakeMissionaryRepo.update(missionaryId, {} as any);
      // 직접 store 접근이 불가하므로, findWithDetails로 확인 후
      // 이 테스트에서는 missionary factory로 만든 객체를 직접 설정
      // => FakeMissionaryRepo의 store를 직접 조작 필요

      // 대안: 정원을 0으로 설정하여 currentParticipantCount(0) >= max(0) 조건 충족
      await fakeMissionaryRepo.update(missionaryId, {
        maximumParticipantCount: 0,
      } as any);

      await expect(processor.process(makeJob(makeDto()))).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
