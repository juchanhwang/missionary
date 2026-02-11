import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { validateEnv } from '@/common/config/env.validation';
import { EncryptionModule } from '@/common/encryption/encryption.module';
import { RolesGuard } from '@/common/guards/roles.guard';
import { BullModule } from '@/common/queue/bull.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { BoardModule } from './board/board.module';
import { ChurchModule } from './church/church.module';
import { PrismaModule } from './database/prisma.module';
import { MissionGroupModule } from './mission-group/mission-group.module';
import { MissionaryModule } from './missionary/missionary.module';
import { ParticipationModule } from './participation/participation.module';
import { RegionModule } from './region/region.module';
import { StaffModule } from './staff/staff.module';
import { TeamModule } from './team/team.module';
import { TermsModule } from './terms/terms.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    EncryptionModule,
    ScheduleModule.forRoot(),
    BullModule,
    PrismaModule,
    UserModule,
    AuthModule,
    RegionModule,
    MissionGroupModule,
    ChurchModule,
    MissionaryModule,
    StaffModule,
    ParticipationModule,
    TeamModule,
    BoardModule,
    TermsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
