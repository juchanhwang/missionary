import { Module } from '@nestjs/common';

import { PASSWORD_HASHER } from '@/common/interfaces/password-hasher.interface';
import { BcryptPasswordHasher } from '@/common/providers/bcrypt-password-hasher';

import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { USER_REPOSITORY } from './repositories/user-repository.interface';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [UserService],
})
export class UserModule {}
