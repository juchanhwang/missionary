import { Test } from '@nestjs/testing';

import { EncryptionService } from '@/common/encryption/encryption.service';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '@/common/interfaces/password-hasher.interface';
import { makeUser } from '@/testing/factories/user.factory';
import { FakeUserRepository } from '@/testing/fakes/fake-user.repository';

import { USER_REPOSITORY } from './repositories/user-repository.interface';
import { UserService } from './user.service';

describe('UserService 페이지네이션', () => {
  let userService: UserService;
  let fakeUserRepository: FakeUserRepository;

  const mockPasswordHasher: PasswordHasher = {
    hash: jest.fn(async (pw: string) => 'hashed-' + pw),
    compare: jest.fn(),
  };

  const mockEncryptionService = {
    encrypt: jest.fn((value: string) => 'encrypted-' + value),
    decrypt: jest.fn((value: string) => value.replace('encrypted-', '')),
  };

  beforeEach(async () => {
    fakeUserRepository = new FakeUserRepository();

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useValue: fakeUserRepository },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: EncryptionService, useValue: mockEncryptionService },
      ],
    }).compile();

    userService = module.get(UserService);
    fakeUserRepository.clear();
    jest.clearAllMocks();
  });

  describe('findAll 기본 페이지네이션', () => {
    it('기본 호출 시 { data, total, page, pageSize } 형식으로 반환한다', async () => {
      await fakeUserRepository.create(makeUser({ email: 'a@test.com' }));
      await fakeUserRepository.create(makeUser({ email: 'b@test.com' }));

      const result = await userService.findAll();

      expect(result).toEqual(
        expect.objectContaining({
          data: expect.any(Array),
          total: expect.any(Number),
          page: expect.any(Number),
          pageSize: expect.any(Number),
        }),
      );
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('page=2, pageSize=5로 호출하면 올바른 오프셋으로 조회한다', async () => {
      // 7명의 유저 생성
      for (let i = 0; i < 7; i++) {
        await fakeUserRepository.create(
          makeUser({ email: `user${i}@test.com`, name: `유저${i}` }),
        );
      }

      const result = await userService.findAll({ page: 2, pageSize: 5 });

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
      expect(result.total).toBe(7);
      expect(result.data).toHaveLength(2); // 7 - 5 = 2
    });
  });

  describe('findAll 검색', () => {
    it('search로 이름에 포함된 유저를 검색한다', async () => {
      await fakeUserRepository.create(
        makeUser({ name: '홍길동', email: 'hong@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ name: '김철수', email: 'kim@test.com' }),
      );

      const result = await userService.findAll({ search: '홍길동' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('홍길동');
    });

    it('search로 이메일에 포함된 유저를 검색한다', async () => {
      await fakeUserRepository.create(
        makeUser({ name: '홍길동', email: 'hong@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ name: '김철수', email: 'kim@test.com' }),
      );

      const result = await userService.findAll({ search: 'hong' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('hong@test.com');
    });
  });

  describe('findAll 필터', () => {
    it('role 필터로 ADMIN 유저만 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({ role: 'ADMIN', email: 'admin@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ role: 'USER', email: 'user@test.com' }),
      );

      const result = await userService.findAll({ role: 'ADMIN' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].role).toBe('ADMIN');
      expect(result.total).toBe(1);
    });

    it('provider 필터로 GOOGLE 유저만 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({ provider: 'GOOGLE', email: 'google@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ provider: 'LOCAL', email: 'local@test.com' }),
      );

      const result = await userService.findAll({ provider: 'GOOGLE' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].provider).toBe('GOOGLE');
    });

    it('isBaptized 필터로 세례받은 유저만 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({ isBaptized: true, email: 'baptized@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ isBaptized: false, email: 'not-baptized@test.com' }),
      );

      const result = await userService.findAll({ isBaptized: true });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].isBaptized).toBe(true);
    });
  });

  describe('findAll 소프트 삭제 필터링', () => {
    it('deletedAt이 null인 유저만 조회한다 (삭제된 유저 제외)', async () => {
      fakeUserRepository.seed(
        makeUser({ email: 'active@test.com', deletedAt: null }),
      );
      fakeUserRepository.seed(
        makeUser({
          email: 'deleted@test.com',
          deletedAt: new Date('2024-06-01'),
        }),
      );

      const result = await userService.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('active@test.com');
      expect(result.total).toBe(1);
    });
  });
});
