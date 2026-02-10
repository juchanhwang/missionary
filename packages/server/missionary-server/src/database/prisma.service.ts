import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../prisma/generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
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
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
