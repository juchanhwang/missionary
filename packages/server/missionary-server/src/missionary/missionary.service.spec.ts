import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  MISSION_GROUP_REPOSITORY,
  type MissionGroupRepository,
} from '@/mission-group/repositories/mission-group-repository.interface';
import { makeMissionary, makeMissionGroup } from '@/testing/factories';
import { FakeMissionGroupRepository } from '@/testing/fakes/fake-mission-group.repository';
import { FakeMissionaryPosterRepository } from '@/testing/fakes/fake-missionary-poster.repository';
import { FakeMissionaryRegionRepository } from '@/testing/fakes/fake-missionary-region.repository';
import { FakeMissionaryRepository } from '@/testing/fakes/fake-missionary.repository';

import { CreateMissionaryPosterDto } from './dto/create-missionary-poster.dto';
import { CreateMissionaryRegionDto } from './dto/create-missionary-region.dto';
import { CreateMissionaryDto } from './dto/create-missionary.dto';
import { UpdateMissionaryRegionDto } from './dto/update-missionary-region.dto';
import { UpdateMissionaryDto } from './dto/update-missionary.dto';
import { MissionaryService } from './missionary.service';
import {
  MISSIONARY_POSTER_REPOSITORY,
  type MissionaryPosterRepository,
} from './repositories/missionary-poster-repository.interface';
import {
  MISSIONARY_REGION_REPOSITORY,
  type MissionaryRegionRepository,
} from './repositories/missionary-region-repository.interface';
import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from './repositories/missionary-repository.interface';

describe('MissionaryService', () => {
  let service: MissionaryService;
  let fakeMissionaryRepo: FakeMissionaryRepository;
  let fakeRegionRepo: FakeMissionaryRegionRepository;
  let fakePosterRepo: FakeMissionaryPosterRepository;
  let fakeMissionGroupRepo: FakeMissionGroupRepository;

  beforeEach(async () => {
    fakeMissionaryRepo = new FakeMissionaryRepository();
    fakeRegionRepo = new FakeMissionaryRegionRepository();
    fakePosterRepo = new FakeMissionaryPosterRepository();
    fakeMissionGroupRepo = new FakeMissionGroupRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionaryService,
        {
          provide: MISSIONARY_REPOSITORY,
          useValue: fakeMissionaryRepo as MissionaryRepository,
        },
        {
          provide: MISSIONARY_REGION_REPOSITORY,
          useValue: fakeRegionRepo as MissionaryRegionRepository,
        },
        {
          provide: MISSIONARY_POSTER_REPOSITORY,
          useValue: fakePosterRepo as MissionaryPosterRepository,
        },
        {
          provide: MISSION_GROUP_REPOSITORY,
          useValue: fakeMissionGroupRepo as MissionGroupRepository,
        },
      ],
    }).compile();

    service = module.get<MissionaryService>(MissionaryService);
  });

  afterEach(() => {
    fakeMissionaryRepo.clear();
    fakeRegionRepo.clear();
    fakePosterRepo.clear();
    fakeMissionGroupRepo.clear();
  });

  // ──────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────
  describe('create', () => {
    it('그룹 없이 선교를 생성한다', async () => {
      const dto = new CreateMissionaryDto();
      dto.name = '단기선교';
      dto.startDate = '2024-07-01';
      dto.endDate = '2024-07-07';

      const result = await service.create('user-1', dto);

      expect(result.name).toBe('단기선교');
      expect(result.createdById).toBe('user-1');
      expect(result.missionGroupId).toBeNull();
    });

    it('그룹이 존재할 때 order를 자동 증가시킨다', async () => {
      const group = makeMissionGroup({ name: '필리핀 선교' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeMissionaryRepo.setGroup(group.id, group);

      // 기존 선교 1개 (order=1)
      const existing = makeMissionary({
        missionGroupId: group.id,
        order: 1,
      });
      await fakeMissionaryRepo.create({
        name: existing.name,
        startDate: existing.startDate,
        endDate: existing.endDate,
        missionGroupId: group.id,
        order: 1,
        createdById: 'user-1',
      });

      const dto = new CreateMissionaryDto();
      dto.name = '새 선교';
      dto.startDate = '2024-08-01';
      dto.endDate = '2024-08-07';
      dto.missionGroupId = group.id;

      const result = await service.create('user-1', dto);

      expect(result.order).toBe(2);
    });

    it('그룹이 존재하고 name이 비어있으면 자동 생성한다', async () => {
      const group = makeMissionGroup({ name: '필리핀 선교' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeMissionaryRepo.setGroup(group.id, group);

      const dto = new CreateMissionaryDto();
      dto.name = '';
      dto.startDate = '2024-07-01';
      dto.endDate = '2024-07-07';
      dto.missionGroupId = group.id;

      const result = await service.create('user-1', dto);

      expect(result.name).toBe('1차 필리핀 선교');
      expect(result.order).toBe(1);
    });

    it('존재하지 않는 그룹 ID로 생성 시 NotFoundException을 던진다', async () => {
      const dto = new CreateMissionaryDto();
      dto.name = '선교';
      dto.startDate = '2024-07-01';
      dto.endDate = '2024-07-07';
      dto.missionGroupId = 'non-existent-group-id';

      await expect(service.create('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('그룹이 있고 order를 직접 지정하면 자동 증가하지 않는다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeMissionaryRepo.setGroup(group.id, group);

      const dto = new CreateMissionaryDto();
      dto.name = '선교';
      dto.startDate = '2024-07-01';
      dto.endDate = '2024-07-07';
      dto.missionGroupId = group.id;
      dto.order = 10;

      const result = await service.create('user-1', dto);

      expect(result.order).toBe(10);
    });
  });

  // ──────────────────────────────────────────────
  // findAll
  // ──────────────────────────────────────────────
  describe('findAll', () => {
    it('모든 선교 목록을 반환한다', async () => {
      await fakeMissionaryRepo.create({
        name: '선교 A',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        createdById: 'user-1',
      });
      await fakeMissionaryRepo.create({
        name: '선교 B',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-2',
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });

    it('선교가 없으면 빈 배열을 반환한다', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────
  // findOne
  // ──────────────────────────────────────────────
  describe('findOne', () => {
    it('ID로 선교 상세 정보를 반환한다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '선교',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-1',
      });

      const result = await service.findOne(created.id);

      expect(result.id).toBe(created.id);
      expect(result.name).toBe('선교');
    });

    it('존재하지 않는 ID로 조회 시 NotFoundException을 던진다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // update
  // ──────────────────────────────────────────────
  describe('update', () => {
    it('선교 정보를 업데이트한다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '원래 이름',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-1',
      });

      const dto = new UpdateMissionaryDto();
      dto.name = '수정된 이름';

      const result = await service.update(created.id, dto);

      expect(result.name).toBe('수정된 이름');
    });

    it('존재하지 않는 선교를 업데이트하면 NotFoundException을 던진다', async () => {
      const dto = new UpdateMissionaryDto();
      dto.name = '수정';

      await expect(service.update('non-existent-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('부분 업데이트 시 지정하지 않은 필드는 변경되지 않는다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '원래 이름',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        pastorName: '김목사',
        createdById: 'user-1',
      });

      const dto = new UpdateMissionaryDto();
      dto.name = '새 이름';

      const result = await service.update(created.id, dto);

      expect(result.name).toBe('새 이름');
      expect(result.pastorName).toBe('김목사');
    });
  });

  // ──────────────────────────────────────────────
  // remove
  // ──────────────────────────────────────────────
  describe('remove', () => {
    it('선교를 삭제한다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '삭제 대상',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-1',
      });

      const result = await service.remove(created.id);

      expect(result.id).toBe(created.id);
      expect(fakeMissionaryRepo.getAll()).toHaveLength(0);
    });

    it('존재하지 않는 선교를 삭제하면 NotFoundException을 던진다', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // addRegion
  // ──────────────────────────────────────────────
  describe('addRegion', () => {
    it('선교 그룹에 연계지를 추가한다', async () => {
      const group = makeMissionGroup({ name: '장흥선교' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const dto = new CreateMissionaryRegionDto();
      dto.name = '제주 지교회';

      const result = await service.addRegion(group.id, dto);

      expect(result.name).toBe('제주 지교회');
      expect(result.missionGroupId).toBe(group.id);
    });

    it('존재하지 않는 선교 그룹에 연계지를 추가하면 NotFoundException을 던진다', async () => {
      const dto = new CreateMissionaryRegionDto();
      dto.name = '지역';

      await expect(service.addRegion('non-existent-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // removeRegion
  // ──────────────────────────────────────────────
  describe('removeRegion', () => {
    it('선교 그룹의 연계지를 삭제한다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const region = await fakeRegionRepo.create({
        missionGroupId: group.id,
        name: '삭제 대상 지역',
      });

      const result = await service.removeRegion(group.id, region.id);

      expect(result.id).toBe(region.id);
      expect(result.deletedAt).not.toBeNull();
    });

    it('존재하지 않는 선교 그룹의 연계지를 삭제하면 NotFoundException을 던진다', async () => {
      await expect(
        service.removeRegion('non-existent-id', 'region-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('해당 선교 그룹에 속하지 않는 연계지를 삭제하면 NotFoundException을 던진다', async () => {
      const group = makeMissionGroup({ name: '그룹A' });
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const otherGroup = makeMissionGroup({ name: '그룹B' });
      await fakeMissionGroupRepo.create({
        id: otherGroup.id,
        name: otherGroup.name,
        category: otherGroup.category,
      });

      const region = await fakeRegionRepo.create({
        missionGroupId: otherGroup.id,
        name: '다른 그룹의 지역',
      });

      await expect(service.removeRegion(group.id, region.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // addPoster
  // ──────────────────────────────────────────────
  describe('addPoster', () => {
    it('선교에 포스터를 추가한다', async () => {
      const missionary = await fakeMissionaryRepo.create({
        name: '선교',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-1',
      });

      const dto = new CreateMissionaryPosterDto();
      dto.name = '선교 포스터';
      dto.path = '/uploads/poster.jpg';

      const result = await service.addPoster(missionary.id, dto);

      expect(result.name).toBe('선교 포스터');
      expect(result.path).toBe('/uploads/poster.jpg');
      expect(result.missionaryId).toBe(missionary.id);
    });

    it('존재하지 않는 선교에 포스터를 추가하면 NotFoundException을 던진다', async () => {
      const dto = new CreateMissionaryPosterDto();
      dto.name = '포스터';
      dto.path = '/uploads/poster.jpg';

      await expect(service.addPoster('non-existent-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // getPosters
  // ──────────────────────────────────────────────
  describe('getPosters', () => {
    it('선교의 포스터 목록을 반환한다', async () => {
      const missionary = await fakeMissionaryRepo.create({
        name: '선교',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-1',
      });

      await fakePosterRepo.create({
        missionaryId: missionary.id,
        name: '포스터 A',
        path: '/uploads/a.jpg',
      });
      await fakePosterRepo.create({
        missionaryId: missionary.id,
        name: '포스터 B',
        path: '/uploads/b.jpg',
      });

      const result = await service.getPosters(missionary.id);

      expect(result).toHaveLength(2);
    });

    it('존재하지 않는 선교의 포스터를 조회하면 NotFoundException을 던진다', async () => {
      await expect(service.getPosters('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // removePoster
  // ──────────────────────────────────────────────
  describe('removePoster', () => {
    it('선교의 포스터를 삭제한다', async () => {
      const missionary = await fakeMissionaryRepo.create({
        name: '선교',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-1',
      });

      const poster = await fakePosterRepo.create({
        missionaryId: missionary.id,
        name: '삭제 대상 포스터',
        path: '/uploads/delete.jpg',
      });

      const result = await service.removePoster(missionary.id, poster.id);

      expect(result.id).toBe(poster.id);
      expect(fakePosterRepo.getAll()).toHaveLength(0);
    });

    it('존재하지 않는 선교의 포스터를 삭제하면 NotFoundException을 던진다', async () => {
      await expect(
        service.removePoster('non-existent-id', 'poster-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('해당 선교에 속하지 않는 포스터를 삭제하면 NotFoundException을 던진다', async () => {
      const missionary = await fakeMissionaryRepo.create({
        name: '선교',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-1',
      });

      const otherMissionary = await fakeMissionaryRepo.create({
        name: '다른 선교',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-2',
      });

      const poster = await fakePosterRepo.create({
        missionaryId: otherMissionary.id,
        name: '다른 선교의 포스터',
        path: '/uploads/other.jpg',
      });

      await expect(
        service.removePoster(missionary.id, poster.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ──────────────────────────────────────────────
  // findAllRegions
  // ──────────────────────────────────────────────
  describe('findAllRegions', () => {
    const groupId = 'group-1';

    beforeEach(async () => {
      fakeRegionRepo.setMissionGroup(groupId, {
        id: groupId,
        name: '장흥선교',
      });

      await fakeRegionRepo.create({
        missionGroupId: groupId,
        name: 'OO교회',
        pastorName: '김목사',
      });
      await fakeRegionRepo.create({
        missionGroupId: groupId,
        name: 'XX교회',
        pastorName: '이목사',
      });
      await fakeRegionRepo.create({
        missionGroupId: groupId,
        name: 'AA교회',
        pastorName: '박목사',
      });
    });

    it('필터 없이 호출하면 전체 연계지를 반환한다', async () => {
      const result = await service.findAllRegions({});

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('missionGroupId로 필터링하면 해당 그룹의 연계지만 반환한다', async () => {
      const result = await service.findAllRegions({
        missionGroupId: groupId,
      });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('query로 검색하면 이름/목사명에 매치되는 연계지만 반환한다', async () => {
      const result = await service.findAllRegions({ query: '김목사' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('OO교회');
    });

    it('필터와 검색을 동시에 적용할 수 있다', async () => {
      const result = await service.findAllRegions({
        missionGroupId: groupId,
        query: 'OO',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('OO교회');
    });

    it('total은 필터/검색 조건에 맞는 전체 건수를 반환한다', async () => {
      const result = await service.findAllRegions({
        missionGroupId: groupId,
      });

      expect(result.total).toBe(3);
    });

    it('limit과 offset으로 페이지네이션을 적용한다', async () => {
      const result = await service.findAllRegions({ limit: 1, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(3);
    });

    it('연계지가 없으면 빈 배열과 total 0을 반환한다', async () => {
      fakeRegionRepo.clear();

      const result = await service.findAllRegions({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ──────────────────────────────────────────────
  // updateRegion
  // ──────────────────────────────────────────────
  describe('updateRegion', () => {
    it('존재하는 연계지를 수정하면 수정된 데이터를 반환한다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const region = await fakeRegionRepo.create({
        missionGroupId: group.id,
        name: '원래 교회',
        pastorName: '김목사',
      });

      const dto = new UpdateMissionaryRegionDto();
      dto.name = '수정된 교회';

      const result = await service.updateRegion(group.id, region.id, dto);

      expect(result.name).toBe('수정된 교회');
    });

    it('존재하지 않는 missionGroupId로 수정하면 NotFoundException을 던진다', async () => {
      const dto = new UpdateMissionaryRegionDto();
      dto.name = '수정';

      await expect(
        service.updateRegion('non-existent-id', 'region-id', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('존재하지 않는 regionId로 수정하면 NotFoundException을 던진다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const dto = new UpdateMissionaryRegionDto();
      dto.name = '수정';

      await expect(
        service.updateRegion(group.id, 'non-existent-region', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('일부 필드만 전달하면 해당 필드만 수정된다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const region = await fakeRegionRepo.create({
        missionGroupId: group.id,
        name: '교회',
        pastorName: '김목사',
      });

      const dto = new UpdateMissionaryRegionDto();
      dto.name = '수정된 교회';

      const result = await service.updateRegion(group.id, region.id, dto);

      expect(result.name).toBe('수정된 교회');
      expect(result.pastorName).toBe('김목사');
    });
  });

  describe('findDeletedRegions', () => {
    it('삭제된 연계지만 조회한다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });
      fakeRegionRepo.setMissionGroup(group.id, {
        id: group.id,
        name: group.name,
      });

      await fakeRegionRepo.create({
        missionGroupId: group.id,
        name: '활성 지역',
      });
      const region2 = await fakeRegionRepo.create({
        missionGroupId: group.id,
        name: '삭제된 지역',
      });

      await service.removeRegion(group.id, region2.id);

      const result = await service.findDeletedRegions({});
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('삭제된 지역');

      const activeResult = await service.findAllRegions({});
      expect(activeResult.data).toHaveLength(1);
      expect(activeResult.data[0].name).toBe('활성 지역');
    });
  });

  describe('restoreRegion', () => {
    it('삭제된 연계지를 복구한다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const region = await fakeRegionRepo.create({
        missionGroupId: group.id,
        name: '복구할 지역',
      });

      await service.removeRegion(group.id, region.id);

      const restored = await service.restoreRegion(group.id, region.id);
      expect(restored.deletedAt).toBeNull();
      expect(restored.name).toBe('복구할 지역');
    });

    it('존재하지 않는 선교 그룹이면 NotFoundException을 던진다', async () => {
      await expect(
        service.restoreRegion('non-existent-id', 'region-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('삭제되지 않은 연계지를 복구하면 NotFoundException을 던진다', async () => {
      const group = makeMissionGroup();
      await fakeMissionGroupRepo.create({
        id: group.id,
        name: group.name,
        category: group.category,
      });

      const region = await fakeRegionRepo.create({
        missionGroupId: group.id,
        name: '활성 지역',
      });

      await expect(service.restoreRegion(group.id, region.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──────────────────────────────────────────────
  // updateAcceptingResponses
  // ──────────────────────────────────────────────
  describe('updateAcceptingResponses', () => {
    it('ENROLLMENT_OPENED 상태에서 등록 수신을 중지할 수 있다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '테스트선교',
        startDate: new Date(),
        endDate: new Date(),
        createdById: 'user-1',
        status: 'ENROLLMENT_OPENED',
      });

      const result = await service.updateAcceptingResponses(created.id, {
        isAcceptingResponses: false,
        closedMessage: '잠시 중단합니다.',
      });

      expect(result.isAcceptingResponses).toBe(false);
      expect(result.closedMessage).toBe('잠시 중단합니다.');
    });

    it('등록 수신 중지 후 다시 재개할 수 있다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '테스트선교',
        startDate: new Date(),
        endDate: new Date(),
        createdById: 'user-1',
        status: 'ENROLLMENT_OPENED',
      });

      await service.updateAcceptingResponses(created.id, {
        isAcceptingResponses: false,
      });

      const result = await service.updateAcceptingResponses(created.id, {
        isAcceptingResponses: true,
      });

      expect(result.isAcceptingResponses).toBe(true);
    });

    it('closedMessage를 생략하면 null로 저장된다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '테스트선교',
        startDate: new Date(),
        endDate: new Date(),
        createdById: 'user-1',
        status: 'ENROLLMENT_OPENED',
      });

      const result = await service.updateAcceptingResponses(created.id, {
        isAcceptingResponses: false,
      });

      expect(result.closedMessage).toBeNull();
    });

    it('ENROLLMENT_CLOSED 상태에서는 BadRequestException을 던진다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '테스트선교',
        startDate: new Date(),
        endDate: new Date(),
        createdById: 'user-1',
        status: 'ENROLLMENT_CLOSED',
      });

      await expect(
        service.updateAcceptingResponses(created.id, {
          isAcceptingResponses: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('IN_PROGRESS 상태에서는 BadRequestException을 던진다', async () => {
      const created = await fakeMissionaryRepo.create({
        name: '테스트선교',
        startDate: new Date(),
        endDate: new Date(),
        createdById: 'user-1',
        status: 'IN_PROGRESS',
      });

      await expect(
        service.updateAcceptingResponses(created.id, {
          isAcceptingResponses: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 선교에 대해 NotFoundException을 던진다', async () => {
      await expect(
        service.updateAcceptingResponses('non-existent-id', {
          isAcceptingResponses: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
