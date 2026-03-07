import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EncryptionService } from '@/common/encryption/encryption.service';
import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '@/common/interfaces/password-hasher.interface';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  USER_REPOSITORY,
  type UserRepository,
} from './repositories/user-repository.interface';

import type {
  AuthProvider,
  User,
  UserRole,
} from '../../prisma/generated/prisma';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  private encryptIdentityNumber(identityNumber?: string): string | undefined {
    if (!identityNumber) return undefined;
    return this.encryptionService.encrypt(identityNumber);
  }

  private decryptIdentityNumber(user: User): User {
    if (user.identityNumber) {
      return {
        ...user,
        identityNumber: this.encryptionService.decrypt(user.identityNumber),
      };
    }
    return user;
  }

  private decryptIdentityNumberNullable(user: User | null): User | null {
    if (!user) return null;
    return this.decryptIdentityNumber(user);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('이미 존재하는 이메일입니다');
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);

    const data = {
      ...dto,
      password: hashedPassword,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      baptizedAt: dto.baptizedAt ? new Date(dto.baptizedAt) : undefined,
      identityNumber: this.encryptIdentityNumber(dto.identityNumber),
    };

    const user = await this.userRepository.create(data);
    return this.decryptIdentityNumber(user);
  }

  async findAll() {
    const users = await this.userRepository.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.decryptIdentityNumber(user));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findUnique({ id });

    if (!user) {
      throw new NotFoundException(`User #${id}을 찾을 수 없습니다`);
    }

    return this.decryptIdentityNumber(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    return this.decryptIdentityNumberNullable(user);
  }

  async findByProvider(provider: AuthProvider, providerId: string) {
    const user = await this.userRepository.findByProvider(provider, providerId);
    return this.decryptIdentityNumberNullable(user);
  }

  async findByLoginIdAndRole(loginId: string, role: UserRole) {
    const user = await this.userRepository.findByLoginIdAndRole(loginId, role);
    return this.decryptIdentityNumberNullable(user);
  }

  async createOAuthUser(data: {
    email: string;
    name?: string;
    provider: AuthProvider;
    providerId: string;
  }) {
    const user = await this.userRepository.create(data);
    return this.decryptIdentityNumber(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const { password, ...rest } = dto;

    const data = {
      ...rest,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      baptizedAt: dto.baptizedAt ? new Date(dto.baptizedAt) : undefined,
      identityNumber: this.encryptIdentityNumber(dto.identityNumber),
    };

    const user = await this.userRepository.update({ id }, data);

    return this.decryptIdentityNumber(user);
  }

  async updatePassword(id: string, hashedPassword: string) {
    await this.findOne(id);

    await this.userRepository.updatePassword(id, hashedPassword);
  }

  async remove(id: string) {
    await this.findOne(id);

    const user = await this.userRepository.delete({ id });
    return this.decryptIdentityNumber(user);
  }
}
