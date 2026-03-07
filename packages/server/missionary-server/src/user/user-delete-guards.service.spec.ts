import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { EncryptionService } from '@/common/encryption/encryption.service';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '@/common/interfaces/password-hasher.interface';
import { makeUser } from '@/testing/factories/user.factory';
import { FakeUserRepository } from '@/testing/fakes/fake-user.repository';

import { USER_REPOSITORY } from './repositories/user-repository.interface';
import { UserService } from './user.service';


describe('UserService 삭제 가드', () => {
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

  describe('자기 삭제 방지', () => {
    it('자신의 계정을 삭제하려 하면 BadRequestException을 던진다', async () => {
      const admin = makeUser({ role: 'ADMIN' });
      fakeUserRepository.seed(admin);

      const currentUser: AuthenticatedUser = {
        id: admin.id,
        email: admin.email,
        role: 'ADMIN',
        provider: null,
      };

      await expect(userService.remove(admin.id, currentUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('마지막 ADMIN 보호', () => {
    it('대상이 ADMIN이고 활성 ADMIN이 1명이면 BadRequestException을 던진다', async () => {
      const onlyAdmin = makeUser({ role: 'ADMIN' });
      fakeUserRepository.seed(onlyAdmin);

      const currentUser: AuthenticatedUser = {
        id: 'other-admin-id',
        email: 'other@test.com',
        role: 'ADMIN',
        provider: null,
      };

      await expect(
        userService.remove(onlyAdmin.id, currentUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('대상이 ADMIN이고 활성 ADMIN이 2명 이상이면 삭제에 성공한다', async () => {
      const targetAdmin = makeUser({ role: 'ADMIN' });
      const otherAdmin = makeUser({ role: 'ADMIN' });
      fakeUserRepository.seed(targetAdmin);
      fakeUserRepository.seed(otherAdmin);

      const currentUser: AuthenticatedUser = {
        id: otherAdmin.id,
        email: otherAdmin.email,
        role: 'ADMIN',
        provider: null,
      };

      const result = await userService.remove(targetAdmin.id, currentUser);

      expect(result).toBeDefined();
      const stored = fakeUserRepository
        .getAll()
        .find((u) => u.id === targetAdmin.id);
      expect(stored?.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('STAFF 삭제', () => {
    it('대상이 STAFF이면 ADMIN 수와 무관하게 정상 삭제된다', async () => {
      const staff = makeUser({ role: 'STAFF' });
      const admin = makeUser({ role: 'ADMIN' });
      fakeUserRepository.seed(staff);
      fakeUserRepository.seed(admin);

      const currentUser: AuthenticatedUser = {
        id: admin.id,
        email: admin.email,
        role: 'ADMIN',
        provider: null,
      };

      const result = await userService.remove(staff.id, currentUser);

      expect(result).toBeDefined();
      const stored = fakeUserRepository
        .getAll()
        .find((u) => u.id === staff.id);
      expect(stored?.deletedAt).toBeInstanceOf(Date);
    });
  });
});
