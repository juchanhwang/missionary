import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { makeChurch } from '@/testing/factories/church.factory';
import { FakeChurchRepository } from '@/testing/fakes/fake-church.repository';

import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { CHURCH_REPOSITORY } from './repositories/church-repository.interface';

describe('ChurchService', () => {
  let churchService: ChurchService;
  let fakeChurchRepo: FakeChurchRepository;

  beforeEach(async () => {
    fakeChurchRepo = new FakeChurchRepository();

    const module = await Test.createTestingModule({
      providers: [
        ChurchService,
        { provide: CHURCH_REPOSITORY, useValue: fakeChurchRepo },
      ],
    }).compile();

    churchService = module.get(ChurchService);
    fakeChurchRepo.clear();
  });

  describe('create', () => {
    it('새로운 교회를 정상적으로 생성한다', async () => {
      const createDto: CreateChurchDto = {
        name: '새빛교회',
        pastorName: '김목사',
        pastorPhone: '010-1234-5678',
        addressBasic: '서울시 강남구',
        addressDetail: '1층',
      };

      const result = await churchService.create(createDto);

      expect(result.name).toBe('새빛교회');
      expect(result.pastorName).toBe('김목사');
      expect(result.pastorPhone).toBe('010-1234-5678');
      expect(result.addressBasic).toBe('서울시 강남구');
      expect(result.addressDetail).toBe('1층');
      expect(result.id).toBeDefined();
    });

    it('선택 필드 없이 이름만으로 교회를 생성할 수 있다', async () => {
      const createDto: CreateChurchDto = {
        name: '은혜교회',
      };

      const result = await churchService.create(createDto);

      expect(result.name).toBe('은혜교회');
      expect(result.pastorName).toBeNull();
      expect(result.pastorPhone).toBeNull();
      expect(result.addressBasic).toBeNull();
      expect(result.addressDetail).toBeNull();
    });
  });

  describe('findAll', () => {
    it('모든 교회 목록을 반환한다', async () => {
      const church1 = makeChurch({ name: '교회A' });
      const church2 = makeChurch({ name: '교회B' });
      await fakeChurchRepo.create(church1);
      await fakeChurchRepo.create(church2);

      const result = await churchService.findAll();

      expect(result).toHaveLength(2);
    });

    it('교회가 없으면 빈 배열을 반환한다', async () => {
      const result = await churchService.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('ID로 교회를 조회한다', async () => {
      const church = makeChurch({ name: '찾을교회' });
      await fakeChurchRepo.create(church);

      const result = await churchService.findOne(church.id);

      expect(result.name).toBe('찾을교회');
      expect(result.id).toBe(church.id);
    });

    it('존재하지 않는 교회를 조회하면 NotFoundException을 던진다', async () => {
      await expect(churchService.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('교회 정보를 정상적으로 수정한다', async () => {
      const church = makeChurch({ name: '수정전교회' });
      await fakeChurchRepo.create(church);

      const updateDto: UpdateChurchDto = { name: '수정후교회' };
      const result = await churchService.update(church.id, updateDto);

      expect(result.name).toBe('수정후교회');
    });

    it('일부 필드만 수정할 수 있다', async () => {
      const church = makeChurch({
        name: '원래교회',
        pastorName: '원래목사',
      });
      await fakeChurchRepo.create(church);

      const updateDto: UpdateChurchDto = { pastorName: '새목사' };
      const result = await churchService.update(church.id, updateDto);

      expect(result.pastorName).toBe('새목사');
      expect(result.name).toBe('원래교회');
    });

    it('존재하지 않는 교회를 수정하면 NotFoundException을 던진다', async () => {
      const updateDto: UpdateChurchDto = { name: '수정' };

      await expect(
        churchService.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('교회를 정상적으로 삭제한다', async () => {
      const church = makeChurch({ name: '삭제교회' });
      await fakeChurchRepo.create(church);

      const result = await churchService.remove(church.id);

      expect(result.name).toBe('삭제교회');
      expect(fakeChurchRepo.getAll()).toHaveLength(0);
    });

    it('존재하지 않는 교회를 삭제하면 NotFoundException을 던진다', async () => {
      await expect(churchService.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
