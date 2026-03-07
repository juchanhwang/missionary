import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { makeMissionary } from '@/testing/factories/missionary.factory';
import { makeUser } from '@/testing/factories/user.factory';
import { FakeStaffRepository } from '@/testing/fakes/fake-staff.repository';

import { MissionaryStaffRole } from './dto/create-staff.dto';
import { STAFF_REPOSITORY } from './repositories';
import { StaffService } from './staff.service';

import type { UpdateStaffDto } from './dto/update-staff.dto';

describe('StaffService', () => {
  let staffService: StaffService;
  let fakeStaffRepo: FakeStaffRepository;

  beforeEach(async () => {
    fakeStaffRepo = new FakeStaffRepository();

    const module = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: STAFF_REPOSITORY, useValue: fakeStaffRepo },
      ],
    }).compile();

    staffService = module.get(StaffService);
    fakeStaffRepo.clear();
  });

  describe('create', () => {
    it('선교에 사용자를 스태프로 정상 배정한다', async () => {
      const missionary = makeMissionary();
      const user = makeUser();
      fakeStaffRepo.seedMissionary(missionary);
      fakeStaffRepo.seedUser(user);

      const result = await staffService.create({
        missionaryId: missionary.id,
        userId: user.id,
        role: MissionaryStaffRole.LEADER,
      });

      expect(result.missionaryId).toBe(missionary.id);
      expect(result.userId).toBe(user.id);
      expect(result.role).toBe(MissionaryStaffRole.LEADER);
      expect(result.missionary).toEqual(missionary);
      expect(result.user).toEqual(user);
    });

    it('이미 배정된 사용자를 다시 배정하면 ConflictException을 던진다', async () => {
      const missionary = makeMissionary();
      const user = makeUser();
      fakeStaffRepo.seedMissionary(missionary);
      fakeStaffRepo.seedUser(user);

      await staffService.create({
        missionaryId: missionary.id,
        userId: user.id,
        role: MissionaryStaffRole.MEMBER,
      });

      await expect(
        staffService.create({
          missionaryId: missionary.id,
          userId: user.id,
          role: MissionaryStaffRole.LEADER,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('같은 선교에 다른 사용자는 배정할 수 있다', async () => {
      const missionary = makeMissionary();
      const user1 = makeUser();
      const user2 = makeUser();
      fakeStaffRepo.seedMissionary(missionary);
      fakeStaffRepo.seedUser(user1);
      fakeStaffRepo.seedUser(user2);

      await staffService.create({
        missionaryId: missionary.id,
        userId: user1.id,
        role: MissionaryStaffRole.LEADER,
      });

      const result = await staffService.create({
        missionaryId: missionary.id,
        userId: user2.id,
        role: MissionaryStaffRole.MEMBER,
      });

      expect(result.userId).toBe(user2.id);
    });

    it('같은 사용자를 다른 선교에 배정할 수 있다', async () => {
      const missionary1 = makeMissionary();
      const missionary2 = makeMissionary();
      const user = makeUser();
      fakeStaffRepo.seedMissionary(missionary1);
      fakeStaffRepo.seedMissionary(missionary2);
      fakeStaffRepo.seedUser(user);

      await staffService.create({
        missionaryId: missionary1.id,
        userId: user.id,
        role: MissionaryStaffRole.MEMBER,
      });

      const result = await staffService.create({
        missionaryId: missionary2.id,
        userId: user.id,
        role: MissionaryStaffRole.MEMBER,
      });

      expect(result.missionaryId).toBe(missionary2.id);
    });
  });

  describe('findByMissionary', () => {
    it('선교에 배정된 스태프 목록을 반환한다', async () => {
      const missionary = makeMissionary();
      const user1 = makeUser();
      const user2 = makeUser();
      fakeStaffRepo.seedMissionary(missionary);
      fakeStaffRepo.seedUser(user1);
      fakeStaffRepo.seedUser(user2);

      await staffService.create({
        missionaryId: missionary.id,
        userId: user1.id,
        role: MissionaryStaffRole.LEADER,
      });
      await staffService.create({
        missionaryId: missionary.id,
        userId: user2.id,
        role: MissionaryStaffRole.MEMBER,
      });

      const result = await staffService.findByMissionary(missionary.id);

      expect(result).toHaveLength(2);
    });

    it('배정된 스태프가 없으면 빈 배열을 반환한다', async () => {
      const result = await staffService.findByMissionary('non-existent-id');

      expect(result).toEqual([]);
    });

    it('다른 선교의 스태프는 포함하지 않는다', async () => {
      const missionary1 = makeMissionary();
      const missionary2 = makeMissionary();
      const user = makeUser();
      fakeStaffRepo.seedMissionary(missionary1);
      fakeStaffRepo.seedMissionary(missionary2);
      fakeStaffRepo.seedUser(user);

      await staffService.create({
        missionaryId: missionary1.id,
        userId: user.id,
        role: MissionaryStaffRole.MEMBER,
      });

      const result = await staffService.findByMissionary(missionary2.id);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('ID로 스태프 배정 정보를 조회한다', async () => {
      const missionary = makeMissionary();
      const user = makeUser();
      fakeStaffRepo.seedMissionary(missionary);
      fakeStaffRepo.seedUser(user);

      const created = await staffService.create({
        missionaryId: missionary.id,
        userId: user.id,
        role: MissionaryStaffRole.LEADER,
      });

      const result = await staffService.findOne(created.id);

      expect(result.id).toBe(created.id);
      expect(result.missionary).toEqual(missionary);
      expect(result.user).toEqual(user);
    });

    it('존재하지 않는 ID로 조회하면 NotFoundException을 던진다', async () => {
      await expect(staffService.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('스태프의 역할을 정상적으로 수정한다', async () => {
      const missionary = makeMissionary();
      const user = makeUser();
      fakeStaffRepo.seedMissionary(missionary);
      fakeStaffRepo.seedUser(user);

      const created = await staffService.create({
        missionaryId: missionary.id,
        userId: user.id,
        role: MissionaryStaffRole.MEMBER,
      });

      const updateDto: UpdateStaffDto = {
        role: MissionaryStaffRole.LEADER,
      };

      const result = await staffService.update(created.id, updateDto);

      expect(result.role).toBe(MissionaryStaffRole.LEADER);
    });

    it('존재하지 않는 스태프를 수정하면 NotFoundException을 던진다', async () => {
      const updateDto: UpdateStaffDto = {
        role: MissionaryStaffRole.LEADER,
      };

      await expect(
        staffService.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('role이 undefined이면 기존 값을 유지한다', async () => {
      const missionary = makeMissionary();
      const user = makeUser();
      fakeStaffRepo.seedMissionary(missionary);
      fakeStaffRepo.seedUser(user);

      const created = await staffService.create({
        missionaryId: missionary.id,
        userId: user.id,
        role: MissionaryStaffRole.MEMBER,
      });

      const updateDto: UpdateStaffDto = {};

      const result = await staffService.update(created.id, updateDto);

      expect(result.role).toBe(MissionaryStaffRole.MEMBER);
    });
  });

  describe('remove', () => {
    it('스태프 배정을 정상적으로 삭제한다', async () => {
      const missionary = makeMissionary();
      const user = makeUser();
      fakeStaffRepo.seedMissionary(missionary);
      fakeStaffRepo.seedUser(user);

      const created = await staffService.create({
        missionaryId: missionary.id,
        userId: user.id,
        role: MissionaryStaffRole.MEMBER,
      });

      const result = await staffService.remove(created.id);

      expect(result.id).toBe(created.id);
      await expect(staffService.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('존재하지 않는 스태프를 삭제하면 NotFoundException을 던진다', async () => {
      await expect(staffService.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
