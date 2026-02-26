import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from './database/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  getHealth() {
    return { status: 'ok' };
  }

  async checkDb() {
    const dbUrl = this.configService.get<string>('DATABASE_URL') ?? '';
    let maskedUrl = '';
    try {
      const url = new URL(dbUrl);
      maskedUrl = `${url.protocol}//${url.username}:***@${url.host}${url.pathname}${url.search}`;
    } catch {
      maskedUrl = dbUrl ? '[invalid url]' : '[empty]';
    }

    try {
      const result = await this.prisma.$queryRawUnsafe('SELECT 1 AS ok');
      return { status: 'connected', maskedUrl, result };
    } catch (error: unknown) {
      const err = error as Error & { code?: string; meta?: unknown };
      return {
        status: 'error',
        maskedUrl,
        errorName: err.name,
        errorMessage: err.message,
        errorCode: err.code,
        errorMeta: err.meta,
        errorStack: err.stack?.split('\n').slice(0, 10),
      };
    }
  }
}
