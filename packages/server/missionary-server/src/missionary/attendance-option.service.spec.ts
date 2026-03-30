import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { makeMissionary } from '@/testing/factories/missionary.factory';
import { FakeAttendanceOptionRepository } from '@/testing/fakes/fake-attendance-option.repository';
import { FakeMissionaryRepository } from '@/testing/fakes/fake-missionary.repository';

import { AttendanceOptionService } from './attendance-option.service';
import {
  ATTENDANCE_OPTION_REPOSITORY,
  type AttendanceOptionRepository,
} from './repositories/attendance-option-repository.interface';
import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from './repositories/missionary-repository.interface';

const MISSIONARY_ID = 'missionary-1';
const USER_ID = 'user-1';

describe('AttendanceOptionService', () => {
  let service: AttendanceOptionService;
  let fakeOptionRepo: FakeAttendanceOptionRepository;
  let fakeMissionaryRepo: FakeMissionaryRepository;

  beforeEach(async () => {
    fakeOptionRepo = new FakeAttendanceOptionRepository();
    fakeMissionaryRepo = new FakeMissionaryRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceOptionService,
        {
          provide: ATTENDANCE_OPTION_REPOSITORY,
          useValue: fakeOptionRepo as AttendanceOptionRepository,
        },
        {
          provide: MISSIONARY_REPOSITORY,
          useValue: fakeMissionaryRepo as MissionaryRepository,
        },
      ],
    }).compile();

    service = module.get<AttendanceOptionService>(AttendanceOptionService);

    // 기본 missionary 세팅
    const missionary = makeMissionary({ id: MISSIONARY_ID });
    fakeMissionaryRepo['store'].set(MISSIONARY_ID, missionary);
  });

  afterEach(() => {
    fakeOptionRepo.clear();
    fakeMissionaryRepo.clear();
  });

  // ──────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────

  describe('create', () => {
    it('FULL 타입 참석 옵션을 생성한다', async () => {
      const result = await service.create(
        MISSIONARY_ID,
        { type: 'FULL', label: '전체 참석 (7/21~7/25)', order: 0 },
        USER_ID,
      );

      expect(result.type).toBe('FULL');
      expect(result.label).toBe('전체 참석 (7/21~7/25)');
      expect(result.missionaryId).toBe(MISSIONARY_ID);
      expect(result.createdBy).toBe(USER_ID);
    });

    it('PARTIAL 타입 참석 옵션을 생성한다', async () => {
      const result = await service.create(
        MISSIONARY_ID,
        { type: 'PARTIAL', label: '7/21~7/23 (2박 3일)', order: 1 },
        USER_ID,
      );

      expect(result.type).toBe('PARTIAL');
    });

    it('존재하지 않는 missionary에 생성하면 NotFoundException을 던진다', async () => {
      await expect(
        service.create(
          'non-existent',
          { type: 'FULL', label: '옵션', order: 0 },
          USER_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  // findByMissionary
  // ──────────────────────────────────────────────

  describe('findByMissionary', () => {
    it('missionary의 참석 옵션 목록을 order 순서로 반환한다', async () => {
      await fakeOptionRepo.create({
        missionaryId: MISSIONARY_ID,
        type: 'PARTIAL',
        label: '부분참석',
        order: 1,
      });
      await fakeOptionRepo.create({
        missionaryId: MISSIONARY_ID,
        type: 'FULL',
        label: '전체참석',
        order: 0,
      });

      const result = await service.findByMissionary(MISSIONARY_ID);

      expect(result).toHaveLength(2);
      expect(result[0].label).toBe('전체참석');
      expect(result[1].label).toBe('부분참석');
    });

    it('옵션이 없으면 빈 배열을 반환한다', async () => {
      const result = await service.findByMissionary(MISSIONARY_ID);

      expect(result).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  // update
  // ──────────────────────────────────────────────

  describe('update', () => {
    it('참석 옵션의 label을 수정한다', async () => {
      const option = await fakeOptionRepo.create({
        missionaryId: MISSIONARY_ID,
        type: 'FULL',
        label: '원래 라벨',
        order: 0,
      });

      const result = await service.update(
        option.id,
        { label: '수정된 라벨' },
        USER_ID,
      );

      expect(result.label).toBe('수정된 라벨');
      expect(result.updatedBy).toBe(USER_ID);
    });

    it('존재하지 않는 옵션 수정 시 NotFoundException을 던진다', async () => {
      await expect(
        service.update('non-existent', { label: '수정' }, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  // remove
  // ──────────────────────────────────────────────

  describe('remove', () => {
    it('참가자가 없는 옵션을 삭제한다', async () => {
      const option = await fakeOptionRepo.create({
        missionaryId: MISSIONARY_ID,
        type: 'FULL',
        label: '삭제 대상',
        order: 0,
      });

      const result = await service.remove(option.id);

      expect(result.deletedAt).not.toBeNull();
    });

    it('참가자가 선택한 옵션 삭제 시 BadRequestException을 던진다', async () => {
      const option = await fakeOptionRepo.create({
        missionaryId: MISSIONARY_ID,
        type: 'FULL',
        label: '사용중 옵션',
        order: 0,
      });

      fakeOptionRepo.setParticipationCount(option.id, 5);

      await expect(service.remove(option.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('존재하지 않는 옵션 삭제 시 NotFoundException을 던진다', async () => {
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
