import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PasswordHasher } from '../interfaces/password-hasher.interface';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private static readonly DEFAULT_SALT_ROUNDS = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BcryptPasswordHasher.DEFAULT_SALT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
