import { NotFoundException } from '@nestjs/common';
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

describe('UserService 소프트 삭제', () => {
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

  const adminUser: AuthenticatedUser = {
    id: 'admin-caller-id',
    email: 'admin-caller@test.com',
    role: 'ADMIN',
    provider: null,
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
    // 기본 ADMIN 호출자를 시드하여 마지막 ADMIN 보호에 걸리지 않도록 함
    fakeUserRepository.seed(
      makeUser({ id: adminUser.id, email: adminUser.email!, role: 'ADMIN' }),
    );
    jest.clearAllMocks();
  });

  describe('remove (소프트 삭제)', () => {
    it('remove() 호출 시 deletedAt을 설정하고 데이터를 보존한다', async () => {
      const user = makeUser({ email: 'soft-delete@test.com' });
      await fakeUserRepository.create(user);

      const result = await userService.remove(user.id, adminUser);

      expect(result.email).toBe('soft-delete@test.com');

      const stored = fakeUserRepository.getAll().find((u) => u.id === user.id);
      expect(stored).toBeDefined();
      expect(stored?.deletedAt).toBeInstanceOf(Date);
    });

    it('소프트 삭제 후 findByEmail()은 null을 반환한다', async () => {
      const user = makeUser({ email: 'deleted-email@test.com' });
      await fakeUserRepository.create(user);

      await userService.remove(user.id, adminUser);

      const result = await userService.findByEmail('deleted-email@test.com');
      expect(result).toBeNull();
    });

    it('소프트 삭제 후 findByProvider()는 null을 반환한다', async () => {
      const user = makeUser({
        provider: 'GOOGLE',
        providerId: 'google-soft-delete',
      });
      await fakeUserRepository.create(user);

      await userService.remove(user.id, adminUser);

      const result = await userService.findByProvider(
        'GOOGLE',
        'google-soft-delete',
      );
      expect(result).toBeNull();
    });

    it('소프트 삭제 후 findByLoginIdAndRole()은 null을 반환한다', async () => {
      const user = makeUser({
        loginId: 'admin-soft-delete',
        role: 'ADMIN',
      });
      await fakeUserRepository.create(user);

      await userService.remove(user.id, adminUser);

      const result = await userService.findByLoginIdAndRole(
        'admin-soft-delete',
        'ADMIN',
      );
      expect(result).toBeNull();
    });

    it('존재하지 않는 사용자를 삭제하면 NotFoundException을 던진다', async () => {
      await expect(
        userService.remove('non-existent-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
