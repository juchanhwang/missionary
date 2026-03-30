import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { makeMissionary } from '@/testing/factories/missionary.factory';
import { FakeFormFieldRepository } from '@/testing/fakes/fake-form-field.repository';
import { FakeMissionaryRepository } from '@/testing/fakes/fake-missionary.repository';

import { FormFieldService } from './form-field.service';
import {
  FORM_FIELD_REPOSITORY,
  type FormFieldRepository,
} from './repositories/form-field-repository.interface';
import {
  MISSIONARY_REPOSITORY,
  type MissionaryRepository,
} from './repositories/missionary-repository.interface';

const MISSIONARY_ID = 'missionary-1';
const USER_ID = 'user-1';

describe('FormFieldService', () => {
  let service: FormFieldService;
  let fakeFieldRepo: FakeFormFieldRepository;
  let fakeMissionaryRepo: FakeMissionaryRepository;

  beforeEach(async () => {
    fakeFieldRepo = new FakeFormFieldRepository();
    fakeMissionaryRepo = new FakeMissionaryRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormFieldService,
        {
          provide: FORM_FIELD_REPOSITORY,
          useValue: fakeFieldRepo as FormFieldRepository,
        },
        {
          provide: MISSIONARY_REPOSITORY,
          useValue: fakeMissionaryRepo as MissionaryRepository,
        },
      ],
    }).compile();

    service = module.get<FormFieldService>(FormFieldService);

    // 기본 missionary 세팅
    // fakeMissionaryRepo는 create 시 자체 ID를 생성하므로, 직접 세팅
    const missionary = makeMissionary({ id: MISSIONARY_ID });
    fakeMissionaryRepo['store'].set(MISSIONARY_ID, missionary);
  });

  afterEach(() => {
    fakeFieldRepo.clear();
    fakeMissionaryRepo.clear();
  });

  // ──────────────────────────────────────────────
  // create
  // ──────────────────────────────────────────────

  describe('create', () => {
    it('TEXT 타입 폼 필드를 생성한다', async () => {
      const result = await service.create(
        MISSIONARY_ID,
        {
          fieldType: 'TEXT',
          label: '알러지 정보',
          isRequired: false,
          order: 0,
        },
        USER_ID,
      );

      expect(result.fieldType).toBe('TEXT');
      expect(result.label).toBe('알러지 정보');
      expect(result.missionaryId).toBe(MISSIONARY_ID);
    });

    it('SELECT 타입 폼 필드를 options와 함께 생성한다', async () => {
      const result = await service.create(
        MISSIONARY_ID,
        {
          fieldType: 'SELECT',
          label: '셔틀버스',
          isRequired: true,
          order: 1,
          options: ['탑승', '미탑승'],
        },
        USER_ID,
      );

      expect(result.fieldType).toBe('SELECT');
      expect(result.options).toEqual(['탑승', '미탑승']);
    });

    it('SELECT 타입인데 options가 없으면 BadRequestException을 던진다', async () => {
      await expect(
        service.create(
          MISSIONARY_ID,
          { fieldType: 'SELECT', label: '선택', isRequired: true, order: 0 },
          USER_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('SELECT 타입인데 options가 빈 배열이면 BadRequestException을 던진다', async () => {
      await expect(
        service.create(
          MISSIONARY_ID,
          {
            fieldType: 'SELECT',
            label: '선택',
            isRequired: true,
            order: 0,
            options: [],
          },
          USER_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 missionary에 생성하면 NotFoundException을 던진다', async () => {
      await expect(
        service.create(
          'non-existent',
          { fieldType: 'TEXT', label: '필드', isRequired: false, order: 0 },
          USER_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('TEXT 타입 생성 시 options가 있어도 null로 저장한다', async () => {
      const result = await service.create(
        MISSIONARY_ID,
        {
          fieldType: 'TEXT',
          label: '텍스트',
          isRequired: false,
          order: 0,
          options: ['무시될값'],
        },
        USER_ID,
      );

      expect(result.options).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  // findByMissionary + hasAnswers
  // ──────────────────────────────────────────────

  describe('findByMissionary', () => {
    it('missionary의 폼 필드 목록을 hasAnswers와 함께 반환한다', async () => {
      const field1 = await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'TEXT',
        label: '필드1',
        isRequired: false,
        order: 0,
      });
      await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'TEXT',
        label: '필드2',
        isRequired: false,
        order: 1,
      });

      // field1에만 답변이 있음
      fakeFieldRepo.setAnswerCount(field1.id, 3);

      const result = await service.findByMissionary(MISSIONARY_ID);

      expect(result).toHaveLength(2);
      expect(result[0].hasAnswers).toBe(true);
      expect(result[1].hasAnswers).toBe(false);
    });

    it('폼 필드가 없으면 빈 배열을 반환한다', async () => {
      const result = await service.findByMissionary(MISSIONARY_ID);

      expect(result).toEqual([]);
    });

    it('order 순서대로 정렬되어 반환한다', async () => {
      await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'TEXT',
        label: '두번째',
        isRequired: false,
        order: 1,
      });
      await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'TEXT',
        label: '첫번째',
        isRequired: false,
        order: 0,
      });

      const result = await service.findByMissionary(MISSIONARY_ID);

      expect(result[0].label).toBe('첫번째');
      expect(result[1].label).toBe('두번째');
    });
  });

  // ──────────────────────────────────────────────
  // update
  // ──────────────────────────────────────────────

  describe('update', () => {
    it('폼 필드의 label을 수정한다', async () => {
      const field = await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'TEXT',
        label: '원래 라벨',
        isRequired: false,
        order: 0,
      });

      const result = await service.update(
        field.id,
        { label: '수정된 라벨' },
        USER_ID,
      );

      expect(result.label).toBe('수정된 라벨');
    });

    it('존재하지 않는 필드 수정 시 NotFoundException을 던진다', async () => {
      await expect(
        service.update('non-existent', { label: '수정' }, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('SELECT 타입에서 options를 업데이트한다', async () => {
      const field = await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'SELECT',
        label: '셔틀',
        isRequired: true,
        order: 0,
        options: ['탑승', '미탑승'],
      });

      const result = await service.update(
        field.id,
        { options: ['탑승', '미탑승', '미정'] },
        USER_ID,
      );

      expect(result.options).toEqual(['탑승', '미탑승', '미정']);
    });
  });

  // ──────────────────────────────────────────────
  // reorder
  // ──────────────────────────────────────────────

  describe('reorder', () => {
    it('폼 필드의 순서를 변경한다', async () => {
      const f1 = await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'TEXT',
        label: '필드A',
        isRequired: false,
        order: 0,
      });
      const f2 = await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'TEXT',
        label: '필드B',
        isRequired: false,
        order: 1,
      });

      const result = await service.reorder(MISSIONARY_ID, [
        { id: f1.id, order: 1 },
        { id: f2.id, order: 0 },
      ]);

      expect(result.message).toContain('2 field(s) reordered');

      // 순서가 바뀌었는지 확인
      const fields = await fakeFieldRepo.findByMissionary(MISSIONARY_ID);
      expect(fields[0].label).toBe('필드B');
      expect(fields[1].label).toBe('필드A');
    });

    it('존재하지 않는 missionary에 reorder하면 NotFoundException을 던진다', async () => {
      await expect(
        service.reorder('non-existent', [{ id: 'any', order: 0 }]),
      ).rejects.toThrow(NotFoundException);
    });

    it('다른 missionary의 fieldId로 reorder하면 BadRequestException을 던진다', async () => {
      const otherField = await fakeFieldRepo.create({
        missionaryId: 'other-missionary',
        fieldType: 'TEXT',
        label: '다른 필드',
        isRequired: false,
        order: 0,
      });

      await expect(
        service.reorder(MISSIONARY_ID, [{ id: otherField.id, order: 0 }]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────
  // remove
  // ──────────────────────────────────────────────

  describe('remove', () => {
    it('폼 필드를 삭제한다', async () => {
      const field = await fakeFieldRepo.create({
        missionaryId: MISSIONARY_ID,
        fieldType: 'TEXT',
        label: '삭제 대상',
        isRequired: false,
        order: 0,
      });

      const result = await service.remove(field.id);

      expect(result.deletedAt).not.toBeNull();

      // 삭제 후 조회 시 null
      const found = await fakeFieldRepo.findById(field.id);
      expect(found).toBeNull();
    });

    it('존재하지 않는 필드 삭제 시 NotFoundException을 던진다', async () => {
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
