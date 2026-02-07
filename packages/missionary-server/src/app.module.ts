import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChurchModule } from './church/church.module';
import { RolesGuard } from './common/guards/roles.guard';
import { PrismaModule } from './database/prisma.module';
import { MissionaryModule } from './missionary/missionary.module';
import { RegionModule } from './region/region.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    RegionModule,
    ChurchModule,
    MissionaryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
