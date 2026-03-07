import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { EncryptionService } from '@/common/encryption/encryption.service';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '@/common/interfaces/password-hasher.interface';
import { makeUser } from '@/testing/factories/user.factory';
import { FakeUserRepository } from '@/testing/fakes/fake-user.repository';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_REPOSITORY } from './repositories/user-repository.interface';
import { UserService } from './user.service';

describe('UserService', () => {
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
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: '홍길동',
    } as CreateUserDto;

    it('새로운 사용자를 정상적으로 생성한다', async () => {
      const result = await userService.create(createDto);

      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('홍길동');
      expect(result.password).toBe('hashed-password123');
    });

    it('비밀번호를 해시하여 저장한다', async () => {
      await userService.create(createDto);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('password123');
    });

    it('주민등록번호가 있으면 암호화하여 저장한다', async () => {
      const dtoWithIdentity: CreateUserDto = {
        ...createDto,
        identityNumber: '900101-1234567',
      } as CreateUserDto;

      const result = await userService.create(dtoWithIdentity);

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith(
        '900101-1234567',
      );
      expect(result.identityNumber).toBe('900101-1234567');
    });

    it('중복 이메일로 등록하면 ConflictException을 던진다', async () => {
      await userService.create(createDto);

      await expect(userService.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('생년월일 문자열을 Date 객체로 변환하여 저장한다', async () => {
      const dtoWithBirthDate: CreateUserDto = {
        ...createDto,
        email: 'birth@example.com',
        birthDate: '1990-01-01',
      } as CreateUserDto;

      const result = await userService.create(dtoWithBirthDate);

      expect(result.birthDate).toEqual(new Date('1990-01-01'));
    });

    it('세례일 문자열을 Date 객체로 변환하여 저장한다', async () => {
      const dtoWithBaptizedAt: CreateUserDto = {
        ...createDto,
        email: 'baptized@example.com',
        baptizedAt: '2020-06-15',
      } as CreateUserDto;

      const result = await userService.create(dtoWithBaptizedAt);

      expect(result.baptizedAt).toEqual(new Date('2020-06-15'));
    });
  });

  describe('findAll', () => {
    it('모든 사용자 목록을 반환한다', async () => {
      const user1 = makeUser({ email: 'user1@test.com' });
      const user2 = makeUser({ email: 'user2@test.com' });
      await fakeUserRepository.create(user1);
      await fakeUserRepository.create(user2);

      const result = await userService.findAll();

      expect(result.data).toHaveLength(2);
    });

    it('사용자가 없으면 빈 배열을 반환한다', async () => {
      const result = await userService.findAll();

      expect(result.data).toEqual([]);
    });

    it('주민등록번호가 있는 사용자는 복호화하여 반환한다', async () => {
      const user = makeUser({ identityNumber: 'encrypted-900101-1234567' });
      await fakeUserRepository.create(user);

      const result = await userService.findAll();

      expect(result.data[0].identityNumber).toBe('900101-1234567');
    });
  });

  describe('findOne', () => {
    it('ID로 사용자를 조회한다', async () => {
      const user = makeUser({ email: 'findone@test.com' });
      await fakeUserRepository.create(user);

      const result = await userService.findOne(user.id);

      expect(result.email).toBe('findone@test.com');
    });

    it('존재하지 않는 ID로 조회하면 NotFoundException을 던진다', async () => {
      await expect(userService.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('주민등록번호가 있는 사용자는 복호화하여 반환한다', async () => {
      const user = makeUser({ identityNumber: 'encrypted-900101-1234567' });
      await fakeUserRepository.create(user);

      const result = await userService.findOne(user.id);

      expect(result.identityNumber).toBe('900101-1234567');
    });
  });

  describe('findByEmail', () => {
    it('이메일로 사용자를 조회한다', async () => {
      const user = makeUser({ email: 'find@test.com' });
      await fakeUserRepository.create(user);

      const result = await userService.findByEmail('find@test.com');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('find@test.com');
    });

    it('존재하지 않는 이메일로 조회하면 null을 반환한다', async () => {
      const result = await userService.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });

    it('주민등록번호가 있는 사용자는 복호화하여 반환한다', async () => {
      const user = makeUser({
        email: 'identity@test.com',
        identityNumber: 'encrypted-900101-1234567',
      });
      await fakeUserRepository.create(user);

      const result = await userService.findByEmail('identity@test.com');

      expect(result?.identityNumber).toBe('900101-1234567');
    });
  });

  describe('findByProvider', () => {
    it('OAuth provider와 providerId로 사용자를 조회한다', async () => {
      const user = makeUser({
        provider: 'GOOGLE',
        providerId: 'google-123',
      });
      await fakeUserRepository.create(user);

      const result = await userService.findByProvider('GOOGLE', 'google-123');

      expect(result).not.toBeNull();
      expect(result?.provider).toBe('GOOGLE');
      expect(result?.providerId).toBe('google-123');
    });

    it('존재하지 않는 provider 정보로 조회하면 null을 반환한다', async () => {
      const result = await userService.findByProvider('KAKAO', 'unknown-id');

      expect(result).toBeNull();
    });
  });

  describe('findByLoginIdAndRole', () => {
    it('loginId와 role로 사용자를 조회한다', async () => {
      const user = makeUser({
        loginId: 'admin001',
        role: 'ADMIN',
      });
      await fakeUserRepository.create(user);

      const result = await userService.findByLoginIdAndRole(
        'admin001',
        'ADMIN',
      );

      expect(result).not.toBeNull();
      expect(result?.loginId).toBe('admin001');
      expect(result?.role).toBe('ADMIN');
    });

    it('존재하지 않는 loginId와 role로 조회하면 null을 반환한다', async () => {
      const result = await userService.findByLoginIdAndRole(
        'nonexistent',
        'USER',
      );

      expect(result).toBeNull();
    });
  });

  describe('createOAuthUser', () => {
    it('OAuth 사용자를 정상적으로 생성한다', async () => {
      const oauthData = {
        email: 'oauth@test.com',
        name: 'OAuth유저',
        provider: 'GOOGLE' as const,
        providerId: 'google-456',
      };

      const result = await userService.createOAuthUser(oauthData);

      expect(result.email).toBe('oauth@test.com');
      expect(result.provider).toBe('GOOGLE');
      expect(result.providerId).toBe('google-456');
    });

    it('이름 없이 OAuth 사용자를 생성할 수 있다', async () => {
      const oauthData = {
        email: 'noname@test.com',
        provider: 'KAKAO' as const,
        providerId: 'kakao-789',
      };

      const result = await userService.createOAuthUser(oauthData);

      expect(result.email).toBe('noname@test.com');
      expect(result.name).toBeNull();
    });
  });

  describe('update', () => {
    it('사용자 정보를 정상적으로 수정한다', async () => {
      const user = makeUser({ email: 'update@test.com', name: '수정전' });
      await fakeUserRepository.create(user);

      const updateDto: UpdateUserDto = { name: '수정후' } as UpdateUserDto;
      const result = await userService.update(user.id, updateDto);

      expect(result.name).toBe('수정후');
    });

    it('존재하지 않는 사용자를 수정하면 NotFoundException을 던진다', async () => {
      const updateDto: UpdateUserDto = { name: '수정' } as UpdateUserDto;

      await expect(
        userService.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('주민등록번호를 암호화하여 수정한다', async () => {
      const user = makeUser({ email: 'encrypt-update@test.com' });
      await fakeUserRepository.create(user);

      const updateDto: UpdateUserDto = {
        identityNumber: '901231-1234567',
      } as UpdateUserDto;
      const result = await userService.update(user.id, updateDto);

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith(
        '901231-1234567',
      );
      expect(result.identityNumber).toBe('901231-1234567');
    });

    it('생년월일 문자열을 Date 객체로 변환하여 수정한다', async () => {
      const user = makeUser({ email: 'birthdate-update@test.com' });
      await fakeUserRepository.create(user);

      const updateDto: UpdateUserDto = {
        birthDate: '1995-05-05',
      } as UpdateUserDto;
      const result = await userService.update(user.id, updateDto);

      expect(result.birthDate).toEqual(new Date('1995-05-05'));
    });

    it('수정 시 password 필드는 data에서 제외한다', async () => {
      const user = makeUser({
        email: 'pw-excluded@test.com',
        password: 'hashed-original',
      });
      await fakeUserRepository.create(user);

      const updateDto: UpdateUserDto = {
        password: 'should-be-ignored',
        name: '이름변경',
      } as UpdateUserDto;
      const result = await userService.update(user.id, updateDto);

      expect(result.name).toBe('이름변경');
      expect(result.password).toBe('hashed-original');
    });
  });

  describe('updatePassword', () => {
    it('사용자 비밀번호를 정상적으로 변경한다', async () => {
      const user = makeUser({
        email: 'pwupdate@test.com',
        password: 'old-hashed',
      });
      await fakeUserRepository.create(user);

      await userService.updatePassword(user.id, 'new-hashed-password');

      const stored = fakeUserRepository.getAll().find((u) => u.id === user.id);
      expect(stored?.password).toBe('new-hashed-password');
    });

    it('존재하지 않는 사용자의 비밀번호를 변경하면 NotFoundException을 던진다', async () => {
      await expect(
        userService.updatePassword('non-existent-id', 'new-hash'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      fakeUserRepository.seed(
        makeUser({ id: adminUser.id, email: adminUser.email!, role: 'ADMIN' }),
      );
    });

    it('사용자를 소프트 삭제한다', async () => {
      const user = makeUser({ email: 'remove@test.com' });
      await fakeUserRepository.create(user);

      const result = await userService.remove(user.id, adminUser);

      expect(result.email).toBe('remove@test.com');
      const stored = fakeUserRepository
        .getAll()
        .find((u) => u.id === user.id);
      expect(stored).toBeDefined();
      expect(stored?.deletedAt).toBeInstanceOf(Date);
    });

    it('존재하지 않는 사용자를 삭제하면 NotFoundException을 던진다', async () => {
      await expect(
        userService.remove('non-existent-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('삭제된 사용자의 주민등록번호를 복호화하여 반환한다', async () => {
      const user = makeUser({
        email: 'remove-decrypt@test.com',
        identityNumber: 'encrypted-900101-1234567',
      });
      await fakeUserRepository.create(user);

      const result = await userService.remove(user.id, adminUser);

      expect(result.identityNumber).toBe('900101-1234567');
    });
  });
});
