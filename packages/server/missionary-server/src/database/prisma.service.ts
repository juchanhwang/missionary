import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../prisma/generated/prisma';

const POOL_MAX = 10;
const IDLE_TIMEOUT_MS = 30_000;
const CONNECTION_TIMEOUT_MS = 10_000;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaPg(
      {
        connectionString: configService.get<string>('DATABASE_URL'),
        max: POOL_MAX,
        idleTimeoutMillis: IDLE_TIMEOUT_MS,
        connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
        keepAlive: true,
      },
      {
        onPoolError: (err: Error) => {
          Logger.error(
            `Database pool error: ${err.message}`,
            err.stack,
            PrismaService.name,
          );
        },
      },
    );

    super({
      adapter,
      log:
        configService.get<string>('NODE_ENV', 'production') === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });

    return this.$extends({
      query: {
        $allModels: {
          async delete({ model, args, query }) {
            return (this as any)[model].update({
              ...args,
              data: { deletedAt: new Date() },
            });
          },
          async deleteMany({ model, args, query }) {
            return (this as any)[model].updateMany({
              ...args,
              data: { deletedAt: new Date() },
            });
          },
          async findFirst({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findFirstOrThrow({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findMany({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findUnique({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async findUniqueOrThrow({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
          async updateMany({ args, query }) {
            args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
        },
      },
    }) as this;
  }

  async onModuleInit() {
    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 2_000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connection established');
        return;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          this.logger.error(
            `Failed to connect to database after ${MAX_RETRIES} attempts`,
            error,
          );
          throw error;
        }
        this.logger.warn(
          `Database connection attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${RETRY_DELAY_MS / 1_000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
