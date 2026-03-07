import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { MissionaryBoardType } from '@/common/enums/missionary-board-type.enum';
import { makeMissionary } from '@/testing/factories';
import { FakeBoardRepository } from '@/testing/fakes/fake-board.repository';

import { BoardService } from './board.service';
import { BOARD_REPOSITORY } from './repositories/board-repository.interface';

describe('BoardService', () => {
  let service: BoardService;
  let fakeBoardRepo: FakeBoardRepository;

  const missionary = makeMissionary();

  beforeEach(async () => {
    fakeBoardRepo = new FakeBoardRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: BOARD_REPOSITORY,
          useValue: fakeBoardRepo,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);

    fakeBoardRepo.setMissionary(missionary.id, missionary);
  });

  afterEach(() => {
    fakeBoardRepo.clear();
  });

  describe('create', () => {
    it('새로운 게시글을 생성한다', async () => {
      const dto = {
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '공지사항 제목',
        content: '공지사항 내용입니다.',
      };

      const result = await service.create(dto);

      expect(result).toMatchObject({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '공지사항 제목',
        content: '공지사항 내용입니다.',
      });
      expect(result.id).toBeDefined();
      expect(result.missionary).toMatchObject({ id: missionary.id });
    });

    it('다른 타입의 게시글을 생성한다', async () => {
      const dto = {
        missionaryId: missionary.id,
        type: MissionaryBoardType.FAQ,
        title: 'FAQ 제목',
        content: 'FAQ 내용입니다.',
      };

      const result = await service.create(dto);

      expect(result.type).toBe(MissionaryBoardType.FAQ);
      expect(result.title).toBe('FAQ 제목');
    });
  });

  describe('findByMissionary', () => {
    it('선교 ID로 모든 게시글을 조회한다', async () => {
      await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '공지사항',
        content: '내용1',
      });
      await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.BUS,
        title: '버스 안내',
        content: '내용2',
      });

      const result = await service.findByMissionary(missionary.id);

      expect(result).toHaveLength(2);
    });

    it('타입 필터를 적용하여 게시글을 조회한다', async () => {
      await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '공지사항',
        content: '내용1',
      });
      await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.BUS,
        title: '버스 안내',
        content: '내용2',
      });
      await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '공지사항2',
        content: '내용3',
      });

      const result = await service.findByMissionary(
        missionary.id,
        MissionaryBoardType.NOTICE,
      );

      expect(result).toHaveLength(2);
      expect(result.every((b) => b.type === MissionaryBoardType.NOTICE)).toBe(
        true,
      );
    });

    it('타입 필터 없이 조회하면 모든 타입의 게시글을 반환한다', async () => {
      await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '공지사항',
        content: '내용1',
      });
      await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.SCHEDULE,
        title: '일정',
        content: '내용2',
      });
      await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.ACCOMMODATION,
        title: '숙소 안내',
        content: '내용3',
      });

      const result = await service.findByMissionary(missionary.id);

      expect(result).toHaveLength(3);
      const types = result.map((b) => b.type);
      expect(types).toContain(MissionaryBoardType.NOTICE);
      expect(types).toContain(MissionaryBoardType.SCHEDULE);
      expect(types).toContain(MissionaryBoardType.ACCOMMODATION);
    });

    it('게시글이 없으면 빈 배열을 반환한다', async () => {
      const result = await service.findByMissionary(missionary.id);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('ID로 게시글을 조회한다', async () => {
      const created = await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '공지사항 제목',
        content: '공지사항 내용입니다.',
      });

      const result = await service.findOne(created.id);

      expect(result.id).toBe(created.id);
      expect(result.title).toBe('공지사항 제목');
      expect(result.missionary).toMatchObject({ id: missionary.id });
    });

    it('존재하지 않는 게시글을 조회하면 NotFoundException을 던진다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('존재하지 않는 게시글 조회 시 ID를 포함한 에러 메시지를 반환한다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Board with ID non-existent-id not found',
      );
    });
  });

  describe('update', () => {
    it('게시글 제목을 수정한다', async () => {
      const created = await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '기존 제목',
        content: '내용',
      });

      const result = await service.update(created.id, { title: '변경된 제목' });

      expect(result.title).toBe('변경된 제목');
    });

    it('게시글 내용을 수정한다', async () => {
      const created = await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '제목',
        content: '기존 내용',
      });

      const result = await service.update(created.id, {
        content: '변경된 내용',
      });

      expect(result.content).toBe('변경된 내용');
    });

    it('게시글 타입을 수정한다', async () => {
      const created = await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '제목',
        content: '내용',
      });

      const result = await service.update(created.id, {
        type: MissionaryBoardType.FAQ,
      });

      expect(result.type).toBe(MissionaryBoardType.FAQ);
    });

    it('여러 필드를 동시에 수정한다', async () => {
      const created = await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '기존 제목',
        content: '기존 내용',
      });

      const result = await service.update(created.id, {
        title: '변경된 제목',
        content: '변경된 내용',
        type: MissionaryBoardType.BUS,
      });

      expect(result).toMatchObject({
        title: '변경된 제목',
        content: '변경된 내용',
        type: MissionaryBoardType.BUS,
      });
    });

    it('존재하지 않는 게시글을 수정하면 NotFoundException을 던진다', async () => {
      await expect(
        service.update('non-existent-id', { title: '변경' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('게시글을 삭제한다', async () => {
      const created = await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '삭제 대상',
        content: '내용',
      });

      const result = await service.remove(created.id);

      expect(result.id).toBe(created.id);
      expect(result.title).toBe('삭제 대상');
    });

    it('삭제 후 해당 게시글을 조회하면 NotFoundException을 던진다', async () => {
      const created = await service.create({
        missionaryId: missionary.id,
        type: MissionaryBoardType.NOTICE,
        title: '삭제 대상',
        content: '내용',
      });

      await service.remove(created.id);

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('존재하지 않는 게시글을 삭제하면 NotFoundException을 던진다', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
