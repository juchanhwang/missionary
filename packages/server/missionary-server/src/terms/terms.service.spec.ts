import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { TermsType } from '@/common/enums/terms-type.enum';
import { makeTerms } from '@/testing/factories';
import { FakeTermsAgreementRepository } from '@/testing/fakes/fake-terms-agreement.repository';
import { FakeTermsRepository } from '@/testing/fakes/fake-terms.repository';

import { TERMS_AGREEMENT_REPOSITORY } from './repositories/terms-agreement-repository.interface';
import { TERMS_REPOSITORY } from './repositories/terms-repository.interface';
import { TermsService } from './terms.service';

describe('TermsService', () => {
  let service: TermsService;
  let fakeTermsRepo: FakeTermsRepository;
  let fakeAgreementRepo: FakeTermsAgreementRepository;

  beforeEach(async () => {
    fakeTermsRepo = new FakeTermsRepository();
    fakeAgreementRepo = new FakeTermsAgreementRepository();

    const module = await Test.createTestingModule({
      providers: [
        TermsService,
        { provide: TERMS_REPOSITORY, useValue: fakeTermsRepo },
        { provide: TERMS_AGREEMENT_REPOSITORY, useValue: fakeAgreementRepo },
      ],
    }).compile();

    service = module.get(TermsService);
  });

  afterEach(() => {
    fakeTermsRepo.clear();
    fakeAgreementRepo.clear();
  });

  describe('create', () => {
    it('약관을 생성하고 생성된 약관을 반환한다', async () => {
      const dto = {
        termsType: TermsType.USING_OF_SERVICE,
        termsUrl: 'https://example.com/terms',
        termsTitle: '서비스 이용약관',
        isUsed: true,
        isEssential: true,
        seq: 1,
      };

      const result = await service.create(dto);

      expect(result.termsTitle).toBe('서비스 이용약관');
      expect(result.termsType).toBe(TermsType.USING_OF_SERVICE);
      expect(result.termsUrl).toBe('https://example.com/terms');
      expect(result.isUsed).toBe(true);
      expect(result.isEssential).toBe(true);
      expect(result.id).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('사용 중인 약관만 반환한다', async () => {
      const active = makeTerms({ isUsed: true, termsTitle: '활성 약관' });
      const inactive = makeTerms({ isUsed: false, termsTitle: '비활성 약관' });
      await fakeTermsRepo.create({
        id: active.id,
        termsType: active.termsType,
        termsTitle: active.termsTitle,
        isUsed: active.isUsed,
      });
      await fakeTermsRepo.create({
        id: inactive.id,
        termsType: inactive.termsType,
        termsTitle: inactive.termsTitle,
        isUsed: inactive.isUsed,
      });

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].termsTitle).toBe('활성 약관');
    });

    it('사용 중인 약관이 없으면 빈 배열을 반환한다', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('ID로 약관을 조회하여 반환한다', async () => {
      const terms = makeTerms({ termsTitle: '개인정보 처리방침' });
      await fakeTermsRepo.create({
        id: terms.id,
        termsType: terms.termsType,
        termsTitle: terms.termsTitle,
      });

      const result = await service.findOne(terms.id);

      expect(result.id).toBe(terms.id);
      expect(result.termsTitle).toBe('개인정보 처리방침');
    });

    it('존재하지 않는 ID로 조회하면 NotFoundException을 던진다', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('약관을 수정하고 수정된 약관을 반환한다', async () => {
      const terms = makeTerms({ termsTitle: '기존 약관' });
      await fakeTermsRepo.create({
        id: terms.id,
        termsType: terms.termsType,
        termsTitle: terms.termsTitle,
      });

      const result = await service.update(terms.id, {
        termsTitle: '수정된 약관',
      });

      expect(result.termsTitle).toBe('수정된 약관');
      expect(result.id).toBe(terms.id);
    });

    it('존재하지 않는 약관을 수정하면 NotFoundException을 던진다', async () => {
      await expect(
        service.update('non-existent-id', { termsTitle: '수정' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('약관을 삭제하고 삭제된 약관을 반환한다', async () => {
      const terms = makeTerms({ termsTitle: '삭제할 약관' });
      await fakeTermsRepo.create({
        id: terms.id,
        termsType: terms.termsType,
        termsTitle: terms.termsTitle,
      });

      const result = await service.remove(terms.id);

      expect(result.id).toBe(terms.id);
      expect(result.termsTitle).toBe('삭제할 약관');

      const all = fakeTermsRepo.getAll();
      expect(all).toHaveLength(0);
    });

    it('존재하지 않는 약관을 삭제하면 NotFoundException을 던진다', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createAgreement', () => {
    it('약관이 존재하고 기존 동의가 없으면 동의를 생성한다', async () => {
      const terms = makeTerms();
      await fakeTermsRepo.create({
        id: terms.id,
        termsType: terms.termsType,
        termsTitle: terms.termsTitle,
      });
      const userId = 'user-123';

      const result = await service.createAgreement(terms.id, {
        userId,
        isAgreed: true,
      });

      expect(result.termsId).toBe(terms.id);
      expect(result.userId).toBe(userId);
      expect(result.isAgreed).toBe(true);
    });

    it('isAgreed를 생략하면 기본값 true로 동의를 생성한다', async () => {
      const terms = makeTerms();
      await fakeTermsRepo.create({
        id: terms.id,
        termsType: terms.termsType,
        termsTitle: terms.termsTitle,
      });

      const result = await service.createAgreement(terms.id, {
        userId: 'user-456',
      });

      expect(result.isAgreed).toBe(true);
    });

    it('존재하지 않는 약관 ID로 동의하면 NotFoundException을 던진다', async () => {
      await expect(
        service.createAgreement('non-existent-terms', {
          userId: 'user-123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('이미 동의한 약관에 다시 동의하면 ConflictException을 던진다', async () => {
      const terms = makeTerms();
      await fakeTermsRepo.create({
        id: terms.id,
        termsType: terms.termsType,
        termsTitle: terms.termsTitle,
      });
      const userId = 'user-123';

      await service.createAgreement(terms.id, { userId });

      await expect(
        service.createAgreement(terms.id, { userId }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserAgreements', () => {
    it('사용자의 약관 동의 목록을 반환한다', async () => {
      const terms1 = makeTerms({ termsTitle: '약관 1' });
      const terms2 = makeTerms({ termsTitle: '약관 2' });
      await fakeTermsRepo.create({
        id: terms1.id,
        termsType: terms1.termsType,
        termsTitle: terms1.termsTitle,
      });
      await fakeTermsRepo.create({
        id: terms2.id,
        termsType: terms2.termsType,
        termsTitle: terms2.termsTitle,
      });
      const userId = 'user-789';

      await service.createAgreement(terms1.id, { userId });
      await service.createAgreement(terms2.id, { userId });

      const result = await service.getUserAgreements(userId);

      expect(result).toHaveLength(2);
      expect(result.every((a) => a.userId === userId)).toBe(true);
    });

    it('동의 이력이 없는 사용자는 빈 배열을 반환한다', async () => {
      const result = await service.getUserAgreements('unknown-user');

      expect(result).toEqual([]);
    });

    it('다른 사용자의 동의 내역은 포함하지 않는다', async () => {
      const terms = makeTerms();
      await fakeTermsRepo.create({
        id: terms.id,
        termsType: terms.termsType,
        termsTitle: terms.termsTitle,
      });

      await service.createAgreement(terms.id, { userId: 'user-A' });
      await service.createAgreement(terms.id, { userId: 'user-B' });

      const result = await service.getUserAgreements('user-A');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-A');
    });
  });
});
