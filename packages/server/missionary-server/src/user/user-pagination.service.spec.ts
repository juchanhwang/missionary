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
    it('searchType=name으로 이름에 포함된 유저를 검색한다', async () => {
      await fakeUserRepository.create(
        makeUser({ name: '홍길동', email: 'hong@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ name: '김철수', email: 'kim@test.com' }),
      );

      const result = await userService.findAll({
        searchType: 'name',
        keyword: '홍길동',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('홍길동');
    });

    it('searchType=loginId로 로그인 아이디에 포함된 유저를 검색한다', async () => {
      await fakeUserRepository.create(
        makeUser({ loginId: 'hong123', email: 'hong@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ loginId: 'kim456', email: 'kim@test.com' }),
      );

      const result = await userService.findAll({
        searchType: 'loginId',
        keyword: 'hong',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].loginId).toBe('hong123');
    });

    it('searchType=phone으로 핸드폰번호에 포함된 유저를 검색한다', async () => {
      await fakeUserRepository.create(
        makeUser({ phoneNumber: '010-1234-5678', email: 'hong@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ phoneNumber: '010-9999-8888', email: 'kim@test.com' }),
      );

      const result = await userService.findAll({
        searchType: 'phone',
        keyword: '1234',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].phoneNumber).toBe('010-1234-5678');
    });

    it('keyword만 있고 searchType이 없으면 검색하지 않는다', async () => {
      await fakeUserRepository.create(
        makeUser({ name: '홍길동', email: 'hong@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ name: '김철수', email: 'kim@test.com' }),
      );

      const result = await userService.findAll({ keyword: '홍길동' } as any);

      // 검색 조건이 무시되어 전체 2명이 반환되어야 한다
      expect(result.data).toHaveLength(2);
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

  // ──────────────────────────────────────────────
  // 페이지네이션 엣지 케이스
  // ──────────────────────────────────────────────
  describe('findAll 페이지네이션 엣지 케이스', () => {
    it('유저가 없으면 빈 배열과 total 0을 반환한다', async () => {
      const result = await userService.findAll();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
    });

    it('마지막 페이지에서 남은 유저만 반환한다', async () => {
      for (let i = 0; i < 12; i++) {
        await fakeUserRepository.create(
          makeUser({ email: `user${i}@test.com` }),
        );
      }

      const result = await userService.findAll({ page: 2, pageSize: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(12);
    });

    it('페이지 범위를 초과하면 빈 배열을 반환한다', async () => {
      await fakeUserRepository.create(makeUser({ email: 'only@test.com' }));

      const result = await userService.findAll({ page: 100, pageSize: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(1);
    });

    it('pageSize=1이면 유저 1명만 반환한다', async () => {
      await fakeUserRepository.create(makeUser({ email: 'a@test.com' }));
      await fakeUserRepository.create(makeUser({ email: 'b@test.com' }));

      const result = await userService.findAll({ page: 1, pageSize: 1 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(2);
    });
  });

  // ──────────────────────────────────────────────
  // 검색 엣지 케이스
  // ──────────────────────────────────────────────
  describe('findAll 검색 엣지 케이스', () => {
    it('검색 결과가 없으면 빈 배열을 반환한다', async () => {
      await fakeUserRepository.create(
        makeUser({ name: '홍길동', email: 'hong@test.com' }),
      );

      const result = await userService.findAll({
        searchType: 'name',
        keyword: '존재하지않는이름',
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('부분 일치로 이름을 검색한다', async () => {
      await fakeUserRepository.create(
        makeUser({ name: '홍길동', email: 'hong@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ name: '홍길순', email: 'hong2@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ name: '김철수', email: 'kim@test.com' }),
      );

      const result = await userService.findAll({
        searchType: 'name',
        keyword: '홍길',
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('검색 결과에 페이지네이션을 적용한다', async () => {
      for (let i = 0; i < 15; i++) {
        await fakeUserRepository.create(
          makeUser({ name: `홍길동${i}`, email: `hong${i}@test.com` }),
        );
      }
      await fakeUserRepository.create(
        makeUser({ name: '김철수', email: 'kim@test.com' }),
      );

      const result = await userService.findAll({
        searchType: 'name',
        keyword: '홍길동',
        page: 2,
        pageSize: 10,
      });

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(15);
      expect(result.page).toBe(2);
    });
  });

  // ──────────────────────────────────────────────
  // 필터 추가 케이스
  // ──────────────────────────────────────────────
  describe('findAll 필터 추가 케이스', () => {
    it('role 필터로 STAFF 유저만 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({ role: 'STAFF', email: 'staff@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ role: 'ADMIN', email: 'admin@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ role: 'USER', email: 'user@test.com' }),
      );

      const result = await userService.findAll({ role: 'STAFF' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].role).toBe('STAFF');
      expect(result.total).toBe(1);
    });

    it('role 필터로 USER 유저만 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({ role: 'ADMIN', email: 'admin@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ role: 'USER', email: 'user1@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ role: 'USER', email: 'user2@test.com' }),
      );

      const result = await userService.findAll({ role: 'USER' });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('provider 필터로 LOCAL 유저만 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({ provider: 'LOCAL', email: 'local@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ provider: 'GOOGLE', email: 'google@test.com' }),
      );

      const result = await userService.findAll({ provider: 'LOCAL' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].provider).toBe('LOCAL');
    });

    it('provider 필터로 KAKAO 유저만 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({ provider: 'KAKAO', email: 'kakao@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ provider: 'LOCAL', email: 'local@test.com' }),
      );

      const result = await userService.findAll({ provider: 'KAKAO' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].provider).toBe('KAKAO');
    });

    it('isBaptized=false로 세례받지 않은 유저만 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({ isBaptized: true, email: 'baptized@test.com' }),
      );
      await fakeUserRepository.create(
        makeUser({ isBaptized: false, email: 'not-baptized@test.com' }),
      );

      const result = await userService.findAll({ isBaptized: false });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].isBaptized).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // 복합 필터
  // ──────────────────────────────────────────────
  describe('findAll 복합 필터', () => {
    it('search + role 조합으로 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({
          name: '홍길동',
          email: 'hong@test.com',
          role: 'ADMIN',
        }),
      );
      await fakeUserRepository.create(
        makeUser({
          name: '홍길순',
          email: 'hong2@test.com',
          role: 'USER',
        }),
      );
      await fakeUserRepository.create(
        makeUser({
          name: '김철수',
          email: 'kim@test.com',
          role: 'ADMIN',
        }),
      );

      const result = await userService.findAll({
        searchType: 'name',
        keyword: '홍',
        role: 'ADMIN',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('홍길동');
      expect(result.total).toBe(1);
    });

    it('role + provider 조합으로 조회한다', async () => {
      await fakeUserRepository.create(
        makeUser({
          role: 'ADMIN',
          provider: 'GOOGLE',
          email: 'admin-google@test.com',
        }),
      );
      await fakeUserRepository.create(
        makeUser({
          role: 'ADMIN',
          provider: 'LOCAL',
          email: 'admin-local@test.com',
        }),
      );
      await fakeUserRepository.create(
        makeUser({
          role: 'USER',
          provider: 'GOOGLE',
          email: 'user-google@test.com',
        }),
      );

      const result = await userService.findAll({
        role: 'ADMIN',
        provider: 'GOOGLE',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('admin-google@test.com');
    });

    it('모든 필터를 동시에 적용한다', async () => {
      await fakeUserRepository.create(
        makeUser({
          name: '홍길동',
          email: 'hong@test.com',
          role: 'ADMIN',
          provider: 'LOCAL',
          isBaptized: true,
        }),
      );
      await fakeUserRepository.create(
        makeUser({
          name: '홍길순',
          email: 'hong2@test.com',
          role: 'ADMIN',
          provider: 'LOCAL',
          isBaptized: false,
        }),
      );
      await fakeUserRepository.create(
        makeUser({
          name: '홍길동Jr',
          email: 'hong3@test.com',
          role: 'USER',
          provider: 'LOCAL',
          isBaptized: true,
        }),
      );

      const result = await userService.findAll({
        searchType: 'name',
        keyword: '홍',
        role: 'ADMIN',
        provider: 'LOCAL',
        isBaptized: true,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('홍길동');
      expect(result.total).toBe(1);
    });

    it('필터 적용 후 total이 필터된 결과 수와 일치한다', async () => {
      for (let i = 0; i < 20; i++) {
        await fakeUserRepository.create(
          makeUser({
            email: `user${i}@test.com`,
            role: i < 5 ? 'ADMIN' : 'USER',
          }),
        );
      }

      const result = await userService.findAll({
        role: 'ADMIN',
        page: 1,
        pageSize: 3,
      });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
    });
  });
});
