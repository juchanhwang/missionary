import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { EncryptionService } from '@/common/encryption/encryption.service';
import { UserRole } from '@/common/enums/user-role.enum';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '@/common/interfaces/password-hasher.interface';
import { makeUser } from '@/testing/factories/user.factory';
import { FakeUserRepository } from '@/testing/fakes/fake-user.repository';

import { UpdateUserDto } from './dto/update-user.dto';
import { USER_REPOSITORY } from './repositories/user-repository.interface';
import { UserService } from './user.service';

describe('UserService - 역할 변경 권한', () => {
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
    id: 'admin-id',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    provider: null,
  };

  const staffUser: AuthenticatedUser = {
    id: 'staff-id',
    email: 'staff@test.com',
    role: UserRole.STAFF,
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
    jest.clearAllMocks();
  });

  describe('ADMIN이 역할을 변경하는 경우', () => {
    it('ADMIN이 사용자의 역할을 STAFF로 변경하면 성공한다', async () => {
      const targetUser = makeUser({
        email: 'target@test.com',
        role: 'USER',
      });
      await fakeUserRepository.create(targetUser);

      const updateDto: UpdateUserDto = {
        role: UserRole.STAFF,
      } as UpdateUserDto;
      const result = await userService.update(
        targetUser.id,
        updateDto,
        adminUser,
      );

      expect(result.role).toBe(UserRole.STAFF);
    });

    it('ADMIN이 사용자의 역할을 ADMIN으로 변경하면 성공한다', async () => {
      const targetUser = makeUser({
        email: 'target2@test.com',
        role: 'USER',
      });
      await fakeUserRepository.create(targetUser);

      const updateDto: UpdateUserDto = {
        role: UserRole.ADMIN,
      } as UpdateUserDto;
      const result = await userService.update(
        targetUser.id,
        updateDto,
        adminUser,
      );

      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('STAFF가 역할을 변경하는 경우', () => {
    it('STAFF가 역할을 변경하려고 하면 ForbiddenException을 던진다', async () => {
      const targetUser = makeUser({
        email: 'target3@test.com',
        role: 'USER',
      });
      await fakeUserRepository.create(targetUser);

      const updateDto: UpdateUserDto = {
        role: UserRole.ADMIN,
      } as UpdateUserDto;

      await expect(
        userService.update(targetUser.id, updateDto, staffUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('역할 변경 없이 일반 수정하는 경우', () => {
    it('role 필드 없이 수정하면 currentUser 없이도 성공한다', async () => {
      const targetUser = makeUser({
        email: 'target4@test.com',
        name: '수정전',
      });
      await fakeUserRepository.create(targetUser);

      const updateDto: UpdateUserDto = { name: '수정후' } as UpdateUserDto;
      const result = await userService.update(targetUser.id, updateDto);

      expect(result.name).toBe('수정후');
    });
  });
});
