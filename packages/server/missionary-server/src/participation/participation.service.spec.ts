import { getQueueToken } from '@nestjs/bullmq';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EncryptionService } from '@/common/encryption/encryption.service';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';
import { FORM_FIELD_REPOSITORY } from '@/missionary/repositories/form-field-repository.interface';
import { makeMissionary } from '@/testing/factories/missionary.factory';
import { makeParticipation } from '@/testing/factories/participation.factory';
import { makeUser } from '@/testing/factories/user.factory';
import { FakeFormAnswerRepository } from '@/testing/fakes/fake-form-answer.repository';
import { FakeFormFieldRepository } from '@/testing/fakes/fake-form-field.repository';
import { FakeParticipationRepository } from '@/testing/fakes/fake-participation.repository';

import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { ParticipationService } from './participation.service';
import { FORM_ANSWER_REPOSITORY } from './repositories/form-answer-repository.interface';
import { PARTICIPATION_REPOSITORY } from './repositories/participation-repository.interface';

const makeAuthUser = (
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser => ({
  id: 'user-1',
  email: 'test@test.com',
  role: 'USER',
  provider: null,
  ...overrides,
});

describe('ParticipationService', () => {
  let service: ParticipationService;
  let fakeParticipationRepo: FakeParticipationRepository;
  let fakeFormAnswerRepo: FakeFormAnswerRepository;
  let fakeFormFieldRepo: FakeFormFieldRepository;
  let mockEncryptionService: { encrypt: jest.Mock; decrypt: jest.Mock };
  let mockQueue: { add: jest.Mock };

  beforeEach(async () => {
    fakeParticipationRepo = new FakeParticipationRepository();
    fakeFormAnswerRepo = new FakeFormAnswerRepository();
    fakeFormFieldRepo = new FakeFormFieldRepository();

    mockEncryptionService = {
      encrypt: jest.fn((value: string) => `encrypted-${value}`),
      decrypt: jest.fn((value: string) => value.replace('encrypted-', '')),
    };

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationService,
        {
          provide: PARTICIPATION_REPOSITORY,
          useValue: fakeParticipationRepo,
        },
        {
          provide: FORM_ANSWER_REPOSITORY,
          useValue: fakeFormAnswerRepo,
        },
        {
          provide: FORM_FIELD_REPOSITORY,
          useValue: fakeFormFieldRepo,
        },
        { provide: EncryptionService, useValue: mockEncryptionService },
        {
          provide: getQueueToken('participation-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<ParticipationService>(ParticipationService);
  });

  afterEach(() => {
    fakeParticipationRepo.clear();
    fakeFormAnswerRepo.clear();
    fakeFormFieldRepo.clear();
  });

  describe('create', () => {
    it('참가 생성 시 BullMQ에 작업을 추가한다', async () => {
      const dto: CreateParticipationDto = {
        missionaryId: 'missionary-1',
        name: '홍길동',
        birthDate: '1990-01-01',
        applyFee: 10000,
        identificationNumber: '900101-1234567',
        isOwnCar: false,
        affiliation: '서울교회',
        attendanceOptionId: 'option-1',
        cohort: 1,
      };
      const userId = 'user-1';

      const result = await service.create(dto, userId);

      expect(mockQueue.add).toHaveBeenCalledWith('create-participation', {
        dto,
        userId,
      });
      expect(result).toEqual({
        jobId: 'job-1',
        message: 'Participation creation queued',
      });
    });

    it('참가 생성 시 jobId를 반환한다', async () => {
      mockQueue.add.mockResolvedValue({ id: 'job-42' });

      const dto: CreateParticipationDto = {
        missionaryId: 'missionary-1',
        name: '김철수',
        birthDate: '1995-05-15',
        applyFee: 20000,
        identificationNumber: '950515-1234567',
        isOwnCar: true,
        affiliation: '부산교회',
        attendanceOptionId: 'option-1',
        cohort: 2,
      };

      const result = await service.create(dto, 'user-2');

      expect(result.jobId).toBe('job-42');
    });
  });

  describe('findAll', () => {
    it('모든 참가 목록을 복호화하여 반환한다', async () => {
      const userId = 'user-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: userId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(userId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      const participation = makeParticipation({
        userId,
        missionaryId,
        identificationNumber: 'encrypted-900101-1234567',
      });
      await fakeParticipationRepo.create(participation);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].identificationNumber).toBe('900101-1234567');
      expect(mockEncryptionService.decrypt).toHaveBeenCalledWith(
        'encrypted-900101-1234567',
      );
    });

    it('필터를 적용하여 참가 목록을 반환한다', async () => {
      const userId = 'user-1';
      const missionaryId1 = 'missionary-1';
      const missionaryId2 = 'missionary-2';
      const user = makeUser({ id: userId });
      const missionary1 = makeMissionary({ id: missionaryId1 });
      const missionary2 = makeMissionary({ id: missionaryId2 });

      fakeParticipationRepo.setUser(userId, user);
      fakeParticipationRepo.setMissionary(missionaryId1, missionary1);
      fakeParticipationRepo.setMissionary(missionaryId2, missionary2);

      await fakeParticipationRepo.create(
        makeParticipation({ userId, missionaryId: missionaryId1 }),
      );
      await fakeParticipationRepo.create(
        makeParticipation({ userId, missionaryId: missionaryId2 }),
      );

      const result = await service.findAll({
        missionaryId: missionaryId1,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].missionaryId).toBe(missionaryId1);
    });

    it('identificationNumber가 없는 참가는 복호화를 건너뛴다', async () => {
      const userId = 'user-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: userId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(userId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      await fakeParticipationRepo.create(
        makeParticipation({
          userId,
          missionaryId,
          identificationNumber: null,
        }),
      );

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].identificationNumber).toBeNull();
      expect(mockEncryptionService.decrypt).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('ID로 참가를 조회하고 복호화하여 반환한다', async () => {
      const userId = 'user-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: userId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(userId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      const participation = makeParticipation({
        id: 'participation-1',
        userId,
        missionaryId,
        identificationNumber: 'encrypted-900101-1234567',
      });
      await fakeParticipationRepo.create(participation);

      const result = await service.findOne('participation-1');

      expect(result.id).toBe('participation-1');
      expect(result.identificationNumber).toBe('900101-1234567');
    });

    it('존재하지 않는 참가 조회 시 NotFoundException을 던진다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('본인의 참가를 수정하고 복호화하여 반환한다', async () => {
      const userId = 'user-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: userId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(userId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      const participation = makeParticipation({
        id: 'participation-1',
        userId,
        missionaryId,
      });
      await fakeParticipationRepo.create(participation);

      const dto: UpdateParticipationDto = { name: '수정된이름' };
      const authUser = makeAuthUser({ id: userId });

      const result = await service.update('participation-1', dto, authUser);

      expect(result.name).toBe('수정된이름');
    });

    it('identificationNumber가 포함된 수정 시 암호화하여 저장한다', async () => {
      const userId = 'user-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: userId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(userId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      const participation = makeParticipation({
        id: 'participation-1',
        userId,
        missionaryId,
      });
      await fakeParticipationRepo.create(participation);

      const dto: UpdateParticipationDto = {
        identificationNumber: '950515-1234567',
      };
      const authUser = makeAuthUser({ id: userId });

      const result = await service.update('participation-1', dto, authUser);

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith(
        '950515-1234567',
      );
      expect(result.identificationNumber).toBe('950515-1234567');
    });

    it('존재하지 않는 참가 수정 시 NotFoundException을 던진다', async () => {
      const dto: UpdateParticipationDto = { name: '수정된이름' };
      const authUser = makeAuthUser();

      await expect(
        service.update('non-existent-id', dto, authUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('다른 사용자의 참가 수정 시 ForbiddenException을 던진다', async () => {
      const ownerId = 'owner-1';
      const otherUserId = 'other-user-1';
      const missionaryId = 'missionary-1';

      const participation = makeParticipation({
        id: 'participation-1',
        userId: ownerId,
        missionaryId,
      });
      await fakeParticipationRepo.create(participation);

      const dto: UpdateParticipationDto = { name: '수정된이름' };
      const authUser = makeAuthUser({ id: otherUserId });

      await expect(
        service.update('participation-1', dto, authUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ADMIN이 타인 participation을 수정할 수 있다', async () => {
      const ownerId = 'owner-1';
      const adminId = 'admin-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: ownerId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(ownerId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      const participation = makeParticipation({
        id: 'participation-1',
        userId: ownerId,
        missionaryId,
      });
      await fakeParticipationRepo.create(participation);

      const adminUser = makeAuthUser({ id: adminId, role: 'ADMIN' });
      const dto: UpdateParticipationDto = { name: '관리자수정' };

      const result = await service.update('participation-1', dto, adminUser);
      expect(result.name).toBe('관리자수정');
    });
  });

  describe('remove', () => {
    it('본인의 참가를 삭제하고 성공 메시지를 반환한다', async () => {
      const userId = 'user-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: userId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(userId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      const participation = makeParticipation({
        id: 'participation-1',
        userId,
        missionaryId,
      });
      await fakeParticipationRepo.create(participation);

      const authUser = makeAuthUser({ id: userId });
      const result = await service.remove('participation-1', authUser);

      expect(result).toEqual({
        message: 'Participation deleted successfully',
      });
    });

    it('존재하지 않는 참가 삭제 시 NotFoundException을 던진다', async () => {
      const authUser = makeAuthUser();
      await expect(service.remove('non-existent-id', authUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('다른 사용자의 참가 삭제 시 ForbiddenException을 던진다', async () => {
      const ownerId = 'owner-1';
      const otherUserId = 'other-user-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: ownerId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(ownerId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      const participation = makeParticipation({
        id: 'participation-1',
        userId: ownerId,
        missionaryId,
      });
      await fakeParticipationRepo.create(participation);

      const authUser = makeAuthUser({ id: otherUserId });

      await expect(service.remove('participation-1', authUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('approvePayments', () => {
    it('여러 참가의 결제를 승인하고 성공 메시지를 반환한다', async () => {
      const userId = 'user-1';
      const missionaryId = 'missionary-1';

      const participation1 = makeParticipation({
        id: 'p-1',
        userId,
        missionaryId,
        isPaid: false,
      });
      const participation2 = makeParticipation({
        id: 'p-2',
        userId,
        missionaryId,
        isPaid: false,
      });

      await fakeParticipationRepo.create(participation1);
      await fakeParticipationRepo.create(participation2);

      const result = await service.approvePayments(['p-1', 'p-2']);

      expect(result).toEqual({
        message: '2 participation(s) approved',
      });
    });

    it('승인 후 참가의 isPaid가 true로 변경된다', async () => {
      const userId = 'user-1';
      const missionaryId = 'missionary-1';
      const user = makeUser({ id: userId });
      const missionary = makeMissionary({ id: missionaryId });

      fakeParticipationRepo.setUser(userId, user);
      fakeParticipationRepo.setMissionary(missionaryId, missionary);

      const participation = makeParticipation({
        id: 'p-1',
        userId,
        missionaryId,
        isPaid: false,
      });
      await fakeParticipationRepo.create(participation);

      await service.approvePayments(['p-1']);

      const updated = await fakeParticipationRepo.findUnique({
        id: 'p-1',
      });
      expect(updated?.isPaid).toBe(true);
    });

    it('빈 배열로 승인 시 0건 승인 메시지를 반환한다', async () => {
      const result = await service.approvePayments([]);

      expect(result).toEqual({
        message: '0 participation(s) approved',
      });
    });
  });
});
