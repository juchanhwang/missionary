import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { MISSIONARY_REGION_REPOSITORY } from '@/missionary/repositories/missionary-region-repository.interface';
import { MISSIONARY_REPOSITORY } from '@/missionary/repositories/missionary-repository.interface';
import {
  makeChurch,
  makeMissionary,
  makeMissionaryRegion,
  makeUser,
} from '@/testing/factories';
import { FakeMissionaryRegionRepository } from '@/testing/fakes/fake-missionary-region.repository';
import { FakeMissionaryRepository } from '@/testing/fakes/fake-missionary.repository';
import { FakeTeamRepository } from '@/testing/fakes/fake-team.repository';

import { TEAM_REPOSITORY } from './repositories';
import { TeamService } from './team.service';

describe('TeamService', () => {
  let service: TeamService;
  let fakeTeamRepo: FakeTeamRepository;
  let fakeMissionaryRepo: FakeMissionaryRepository;
  let fakeRegionRepo: FakeMissionaryRegionRepository;

  beforeEach(async () => {
    fakeTeamRepo = new FakeTeamRepository();
    fakeMissionaryRepo = new FakeMissionaryRepository();
    fakeRegionRepo = new FakeMissionaryRegionRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: TEAM_REPOSITORY, useValue: fakeTeamRepo },
        { provide: MISSIONARY_REPOSITORY, useValue: fakeMissionaryRepo },
        { provide: MISSIONARY_REGION_REPOSITORY, useValue: fakeRegionRepo },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
  });

  afterEach(() => {
    fakeTeamRepo.clear();
    fakeMissionaryRepo.clear();
    fakeRegionRepo.clear();
  });

  describe('create', () => {
    it('새로운 팀을 생성한다', async () => {
      const missionary = makeMissionary();
      fakeTeamRepo.seedMissionary(missionary);

      const dto = {
        missionaryId: missionary.id,
        leaderUserId: 'leader-user-id',
        leaderUserName: '김팀장',
        teamName: '1팀',
      };

      const result = await service.create(dto);

      expect(result).toMatchObject({
        teamName: '1팀',
        leaderUserId: 'leader-user-id',
        leaderUserName: '김팀장',
        missionaryId: missionary.id,
      });
      expect(result.id).toBeDefined();
    });

    it('교회 정보를 포함하여 팀을 생성한다', async () => {
      const missionary = makeMissionary();
      const church = makeChurch();
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedChurch(church);

      const dto = {
        missionaryId: missionary.id,
        churchId: church.id,
        leaderUserId: 'leader-user-id',
        leaderUserName: '김팀장',
        teamName: '2팀',
      };

      const result = await service.create(dto);

      expect(result.churchId).toBe(church.id);
      expect(result.church).toMatchObject({ id: church.id });
    });

    it('교회 없이 팀을 생성하면 church가 null이다', async () => {
      const missionary = makeMissionary();
      fakeTeamRepo.seedMissionary(missionary);

      const dto = {
        missionaryId: missionary.id,
        leaderUserId: 'leader-user-id',
        leaderUserName: '김팀장',
        teamName: '3팀',
      };

      const result = await service.create(dto);

      expect(result.church).toBeNull();
    });

    it('missionaryRegionId 없이 생성하면 missionaryRegion이 null이다', async () => {
      const missionary = makeMissionary();
      fakeTeamRepo.seedMissionary(missionary);

      const result = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'leader-user-id',
        leaderUserName: '김팀장',
        teamName: '미연결팀',
      });

      expect(result.missionaryRegionId).toBeNull();
      expect(result.missionaryRegion).toBeNull();
    });

    it('같은 missionGroup의 missionaryRegionId로 생성하면 성공한다', async () => {
      const missionGroupId = 'mg-1';
      const missionary = makeMissionary({ missionGroupId });
      const region = makeMissionaryRegion({ missionGroupId });
      fakeMissionaryRepo.seed(missionary);
      fakeRegionRepo.seed(region);
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedRegion(region);

      const result = await service.create({
        missionaryId: missionary.id,
        missionaryRegionId: region.id,
        leaderUserId: 'leader-1',
        leaderUserName: '김팀장',
        teamName: '연계팀',
      });

      expect(result.missionaryRegionId).toBe(region.id);
      expect(result.missionaryRegion).toMatchObject({ id: region.id });
    });

    it('다른 missionGroup의 missionaryRegionId로 생성하면 BadRequestException을 던진다', async () => {
      const missionary = makeMissionary({ missionGroupId: 'mg-1' });
      const region = makeMissionaryRegion({ missionGroupId: 'mg-2' });
      fakeMissionaryRepo.seed(missionary);
      fakeRegionRepo.seed(region);
      fakeTeamRepo.seedMissionary(missionary);

      await expect(
        service.create({
          missionaryId: missionary.id,
          missionaryRegionId: region.id,
          leaderUserId: 'leader-1',
          leaderUserName: '김팀장',
          teamName: '잘못된팀',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 missionaryRegionId로 생성하면 BadRequestException을 던진다', async () => {
      const missionary = makeMissionary({ missionGroupId: 'mg-1' });
      fakeMissionaryRepo.seed(missionary);
      fakeTeamRepo.seedMissionary(missionary);

      await expect(
        service.create({
          missionaryId: missionary.id,
          missionaryRegionId: 'nonexistent-region-id',
          leaderUserId: 'leader-1',
          leaderUserName: '김팀장',
          teamName: '없는연계지팀',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('missionGroupId가 null인 missionary에 missionaryRegionId를 연결하면 BadRequestException을 던진다', async () => {
      const missionary = makeMissionary({ missionGroupId: null });
      const region = makeMissionaryRegion({ missionGroupId: 'mg-1' });
      fakeMissionaryRepo.seed(missionary);
      fakeRegionRepo.seed(region);
      fakeTeamRepo.seedMissionary(missionary);

      await expect(
        service.create({
          missionaryId: missionary.id,
          missionaryRegionId: region.id,
          leaderUserId: 'leader-1',
          leaderUserName: '김팀장',
          teamName: '그룹없음팀',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 missionaryId로 region 검증을 시도하면 NotFoundException을 던진다', async () => {
      const region = makeMissionaryRegion({ missionGroupId: 'mg-1' });
      fakeRegionRepo.seed(region);
      // missionary는 fakeMissionaryRepo에 시드하지 않음 → findWithDetails가 null 반환

      await expect(
        service.create({
          missionaryId: 'nonexistent-missionary-id',
          missionaryRegionId: region.id,
          leaderUserId: 'leader-1',
          leaderUserName: '김팀장',
          teamName: '없는선교팀',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('모든 팀을 조회한다', async () => {
      const missionary = makeMissionary();
      fakeTeamRepo.seedMissionary(missionary);

      await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더1',
        teamName: 'A팀',
      });
      await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-2',
        leaderUserName: '리더2',
        teamName: 'B팀',
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });

    it('missionaryId로 필터링하여 해당 선교의 팀만 반환한다', async () => {
      const missionaryA = makeMissionary();
      const missionaryB = makeMissionary();
      fakeTeamRepo.seedMissionary(missionaryA);
      fakeTeamRepo.seedMissionary(missionaryB);

      await service.create({
        missionaryId: missionaryA.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더1',
        teamName: 'A선교 팀',
      });
      await service.create({
        missionaryId: missionaryB.id,
        leaderUserId: 'user-2',
        leaderUserName: '리더2',
        teamName: 'B선교 팀',
      });

      const result = await service.findAll(missionaryA.id);

      expect(result).toHaveLength(1);
      expect(result[0].teamName).toBe('A선교 팀');
    });

    it('팀이 없으면 빈 배열을 반환한다', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('ID로 팀을 멤버와 함께 조회한다', async () => {
      const missionary = makeMissionary();
      fakeTeamRepo.seedMissionary(missionary);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '조회팀',
      });

      const result = await service.findOne(created.id);

      expect(result.teamName).toBe('조회팀');
      expect(result.missionary.id).toBe(missionary.id);
      expect(result.teamMembers).toEqual([]);
    });

    it('존재하지 않는 팀을 조회하면 NotFoundException을 던진다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('존재하지 않는 팀 조회 시 팀 ID를 에러 메시지에 포함한다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Team with ID non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    it('팀 이름을 변경한다', async () => {
      const missionary = makeMissionary();
      fakeTeamRepo.seedMissionary(missionary);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '기존이름',
      });

      const result = await service.update(created.id, { teamName: '변경이름' });

      expect(result.teamName).toBe('변경이름');
    });

    it('missionaryId를 변경한다', async () => {
      const missionaryA = makeMissionary();
      const missionaryB = makeMissionary();
      fakeTeamRepo.seedMissionary(missionaryA);
      fakeTeamRepo.seedMissionary(missionaryB);

      const created = await service.create({
        missionaryId: missionaryA.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      const result = await service.update(created.id, {
        missionaryId: missionaryB.id,
      });

      expect(result.missionaryId).toBe(missionaryB.id);
    });

    it('churchId를 변경한다', async () => {
      const missionary = makeMissionary();
      const church = makeChurch();
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedChurch(church);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      const result = await service.update(created.id, {
        churchId: church.id,
      });

      expect(result.churchId).toBe(church.id);
      expect(result.church).toMatchObject({ id: church.id });
    });

    it('churchId에 빈 문자열을 전달하면 교회 연결을 해제한다', async () => {
      const missionary = makeMissionary();
      const church = makeChurch();
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedChurch(church);

      const created = await service.create({
        missionaryId: missionary.id,
        churchId: church.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      expect(created.churchId).toBe(church.id);

      const result = await service.update(created.id, {
        churchId: '',
      });

      expect(result.churchId).toBeNull();
      expect(result.church).toBeNull();
    });

    it('churchId가 undefined이면 교회 정보가 변경되지 않는다', async () => {
      const missionary = makeMissionary();
      const church = makeChurch();
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedChurch(church);

      const created = await service.create({
        missionaryId: missionary.id,
        churchId: church.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      const result = await service.update(created.id, {
        teamName: '이름만변경',
      });

      expect(result.churchId).toBe(church.id);
      expect(result.teamName).toBe('이름만변경');
    });

    it('존재하지 않는 팀을 수정하면 NotFoundException을 던진다', async () => {
      await expect(
        service.update('non-existent-id', { teamName: '변경' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('missionaryRegionId를 새로 연결한다', async () => {
      const missionary = makeMissionary({ missionGroupId: 'mg-1' });
      const region = makeMissionaryRegion({ missionGroupId: 'mg-1' });
      fakeMissionaryRepo.seed(missionary);
      fakeRegionRepo.seed(region);
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedRegion(region);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'leader-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      const result = await service.update(created.id, {
        missionaryRegionId: region.id,
      });

      expect(result.missionaryRegionId).toBe(region.id);
      expect(result.missionaryRegion).toMatchObject({ id: region.id });
    });

    it('missionaryRegionId에 빈 문자열을 전달하면 연계지 연결을 해제한다', async () => {
      const missionary = makeMissionary({ missionGroupId: 'mg-1' });
      const region = makeMissionaryRegion({ missionGroupId: 'mg-1' });
      fakeMissionaryRepo.seed(missionary);
      fakeRegionRepo.seed(region);
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedRegion(region);

      const created = await service.create({
        missionaryId: missionary.id,
        missionaryRegionId: region.id,
        leaderUserId: 'leader-1',
        leaderUserName: '리더',
        teamName: '팀',
      });
      expect(created.missionaryRegionId).toBe(region.id);

      const result = await service.update(created.id, {
        missionaryRegionId: '',
      });

      expect(result.missionaryRegionId).toBeNull();
      expect(result.missionaryRegion).toBeNull();
    });

    it('다른 missionGroup의 missionaryRegionId로 변경하면 BadRequestException을 던진다', async () => {
      const missionary = makeMissionary({ missionGroupId: 'mg-1' });
      const otherRegion = makeMissionaryRegion({ missionGroupId: 'mg-2' });
      fakeMissionaryRepo.seed(missionary);
      fakeRegionRepo.seed(otherRegion);
      fakeTeamRepo.seedMissionary(missionary);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'leader-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      await expect(
        service.update(created.id, { missionaryRegionId: otherRegion.id }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('팀을 삭제한다', async () => {
      const missionary = makeMissionary();
      fakeTeamRepo.seedMissionary(missionary);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '삭제팀',
      });

      const result = await service.remove(created.id);

      expect(result.teamName).toBe('삭제팀');

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('존재하지 않는 팀을 삭제하면 NotFoundException을 던진다', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('팀을 삭제하면 연결된 participation의 teamId가 함께 detach된다', async () => {
      const missionary = makeMissionary();
      fakeTeamRepo.seedMissionary(missionary);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'leader-1',
        leaderUserName: '리더',
        teamName: '연결팀',
      });

      // 팀과 연결된 participation을 시드
      fakeTeamRepo.seedParticipationForTeam(created.id, 'p-1');
      fakeTeamRepo.seedParticipationForTeam(created.id, 'p-2');
      expect(fakeTeamRepo.countParticipationsForTeam(created.id)).toBe(2);

      await service.remove(created.id);

      // OQ-2: 팀 삭제 후 participation 연결이 해제되어야 함
      expect(fakeTeamRepo.countParticipationsForTeam(created.id)).toBe(0);
    });
  });

  describe('addMembers', () => {
    it('팀에 멤버를 추가한다', async () => {
      const missionary = makeMissionary();
      const userA = makeUser({ name: '유저A' });
      const userB = makeUser({ name: '유저B' });
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedUser(userA);
      fakeTeamRepo.seedUser(userB);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '멤버팀',
      });

      const result = await service.addMembers(created.id, {
        userIds: [userA.id, userB.id],
      });

      expect(result.teamMembers).toHaveLength(2);
      const memberUserIds = result.teamMembers.map((m) => m.userId);
      expect(memberUserIds).toContain(userA.id);
      expect(memberUserIds).toContain(userB.id);
    });

    it('멤버 추가 시 유저 정보가 포함된다', async () => {
      const missionary = makeMissionary();
      const user = makeUser({ name: '홍길동' });
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedUser(user);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      const result = await service.addMembers(created.id, {
        userIds: [user.id],
      });

      expect(result.teamMembers[0].user.id).toBe(user.id);
      expect(result.teamMembers[0].user.name).toBe('홍길동');
    });

    it('존재하지 않는 팀에 멤버를 추가하면 NotFoundException을 던진다', async () => {
      await expect(
        service.addMembers('non-existent-id', { userIds: ['user-1'] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeMembers', () => {
    it('멤버를 soft delete하면 팀에서 제외된다', async () => {
      const missionary = makeMissionary();
      const userA = makeUser({ name: '유저A' });
      const userB = makeUser({ name: '유저B' });
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedUser(userA);
      fakeTeamRepo.seedUser(userB);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      await service.addMembers(created.id, {
        userIds: [userA.id, userB.id],
      });

      const result = await service.removeMembers(created.id, {
        userIds: [userA.id],
      });

      expect(result.teamMembers).toHaveLength(1);
      expect(result.teamMembers[0].userId).toBe(userB.id);
    });

    it('모든 멤버를 soft delete하면 팀 멤버가 비어있다', async () => {
      const missionary = makeMissionary();
      const user = makeUser();
      fakeTeamRepo.seedMissionary(missionary);
      fakeTeamRepo.seedUser(user);

      const created = await service.create({
        missionaryId: missionary.id,
        leaderUserId: 'user-1',
        leaderUserName: '리더',
        teamName: '팀',
      });

      await service.addMembers(created.id, { userIds: [user.id] });

      const result = await service.removeMembers(created.id, {
        userIds: [user.id],
      });

      expect(result.teamMembers).toHaveLength(0);
    });

    it('존재하지 않는 팀에서 멤버를 제거하면 NotFoundException을 던진다', async () => {
      await expect(
        service.removeMembers('non-existent-id', { userIds: ['user-1'] }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
