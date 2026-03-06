import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { MISSIONARY_REPOSITORY } from '@/missionary/repositories/missionary-repository.interface';
import { makeMissionary, makeMissionGroup } from '@/testing/factories';
import { FakeMissionGroupRepository } from '@/testing/fakes/fake-mission-group.repository';
import { FakeMissionaryRepository } from '@/testing/fakes/fake-missionary.repository';

import { MissionGroupService } from './mission-group.service';
import { MISSION_GROUP_REPOSITORY } from './repositories/mission-group-repository.interface';

describe('MissionGroupService', () => {
  let service: MissionGroupService;
  let fakeMissionGroupRepo: FakeMissionGroupRepository;
  let fakeMissionaryRepo: FakeMissionaryRepository;

  beforeEach(async () => {
    fakeMissionGroupRepo = new FakeMissionGroupRepository();
    fakeMissionaryRepo = new FakeMissionaryRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionGroupService,
        {
          provide: MISSION_GROUP_REPOSITORY,
          useValue: fakeMissionGroupRepo,
        },
        {
          provide: MISSIONARY_REPOSITORY,
          useValue: fakeMissionaryRepo,
        },
      ],
    }).compile();

    service = module.get<MissionGroupService>(MissionGroupService);
  });

  afterEach(() => {
    fakeMissionGroupRepo.clear();
    fakeMissionaryRepo.clear();
  });

  describe('create', () => {
    it('새로운 선교 그룹을 생성한다', async () => {
      const dto = { name: '국내선교', category: 'DOMESTIC' as const };

      const result = await service.create(dto);

      expect(result).toMatchObject({
        name: '국내선교',
        category: 'DOMESTIC',
      });
      expect(result.id).toBeDefined();
    });

    it('설명을 포함하여 선교 그룹을 생성한다', async () => {
      const dto = {
        name: '해외선교',
        description: '해외 선교 그룹입니다',
        category: 'ABROAD' as const,
      };

      const result = await service.create(dto);

      expect(result).toMatchObject({
        name: '해외선교',
        description: '해외 선교 그룹입니다',
        category: 'ABROAD',
      });
    });
  });

  describe('findAll', () => {
    it('모든 선교 그룹을 선교사 수와 함께 반환한다', async () => {
      const group = makeMissionGroup({ name: '그룹A' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const missionary = makeMissionary({ missionGroupId: group.id });
      fakeMissionGroupRepo.setMissionaries(group.id, [missionary]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: '그룹A',
        _count: { missionaries: 1 },
      });
    });

    it('선교 그룹이 없으면 빈 배열을 반환한다', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('여러 그룹의 선교사 수를 각각 정확히 반환한다', async () => {
      const groupA = makeMissionGroup({ name: '그룹A' });
      const groupB = makeMissionGroup({ name: '그룹B' });

      await fakeMissionGroupRepo.create({
        id: groupA.id,
        name: groupA.name,
        category: groupA.category,
      });
      await fakeMissionGroupRepo.create({
        id: groupB.id,
        name: groupB.name,
        category: groupB.category,
      });

      fakeMissionGroupRepo.setMissionaries(groupA.id, [
        makeMissionary({ missionGroupId: groupA.id }),
        makeMissionary({ missionGroupId: groupA.id }),
      ]);
      fakeMissionGroupRepo.setMissionaries(groupB.id, []);

      const result = await service.findAll();

      const countA = result.find((g) => g.name === '그룹A')?._count
        .missionaries;
      const countB = result.find((g) => g.name === '그룹B')?._count
        .missionaries;
      expect(countA).toBe(2);
      expect(countB).toBe(0);
    });
  });

  describe('findOne', () => {
    it('ID로 선교 그룹을 선교사 목록과 함께 반환한다', async () => {
      const group = makeMissionGroup({ name: '국내선교' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const missionary = makeMissionary({
        missionGroupId: group.id,
        deletedAt: null,
      });
      fakeMissionGroupRepo.setMissionaries(group.id, [missionary]);

      const result = await service.findOne(group.id);

      expect(result.name).toBe('국내선교');
      expect(result.missionaries).toHaveLength(1);
      expect(result.missionaries[0].id).toBe(missionary.id);
    });

    it('존재하지 않는 ID로 조회하면 NotFoundException을 던진다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('존재하지 않는 ID로 조회하면 적절한 에러 메시지를 포함한다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'MissionGroup #non-existent-id을 찾을 수 없습니다',
      );
    });
  });

  describe('update', () => {
    it('선교 그룹 이름을 수정한다', async () => {
      const group = makeMissionGroup({ name: '기존이름' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeMissionGroupRepo.setMissionaries(group.id, []);

      const result = await service.update(group.id, { name: '변경이름' });

      expect(result.name).toBe('변경이름');
    });

    it('선교 그룹 카테고리를 수정한다', async () => {
      const group = makeMissionGroup({ category: 'DOMESTIC' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeMissionGroupRepo.setMissionaries(group.id, []);

      const result = await service.update(group.id, { category: 'ABROAD' });

      expect(result.category).toBe('ABROAD');
    });

    it('존재하지 않는 그룹을 수정하면 NotFoundException을 던진다', async () => {
      await expect(
        service.update('non-existent-id', { name: '변경이름' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('선교사가 없는 그룹을 정상 삭제한다', async () => {
      const group = makeMissionGroup({ name: '삭제대상' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeMissionGroupRepo.setMissionaries(group.id, []);

      const result = await service.remove(group.id);

      expect(result.name).toBe('삭제대상');

      const allGroups = fakeMissionGroupRepo.getAll();
      expect(allGroups).toHaveLength(0);
    });

    it('선교사가 존재하는 그룹을 삭제하면 ConflictException을 던진다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeMissionGroupRepo.setMissionaries(group.id, []);

      const missionary = makeMissionary({ missionGroupId: group.id });
      await fakeMissionaryRepo.create({
        name: missionary.name,
        startDate: missionary.startDate,
        endDate: missionary.endDate,
        missionGroupId: group.id,
        createdById: missionary.createdById,
      });

      await expect(service.remove(group.id)).rejects.toThrow(ConflictException);
    });

    it('선교사가 존재하는 그룹 삭제 시 선교사 수를 에러 메시지에 포함한다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeMissionGroupRepo.setMissionaries(group.id, []);

      await fakeMissionaryRepo.create({
        name: '선교1',
        startDate: new Date(),
        endDate: new Date(),
        missionGroupId: group.id,
        createdById: 'user-1',
      });
      await fakeMissionaryRepo.create({
        name: '선교2',
        startDate: new Date(),
        endDate: new Date(),
        missionGroupId: group.id,
        createdById: 'user-1',
      });

      await expect(service.remove(group.id)).rejects.toThrow(
        'Cannot delete mission group with 2 existing missionaries',
      );
    });

    it('존재하지 않는 그룹을 삭제하면 NotFoundException을 던진다', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
