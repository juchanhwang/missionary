import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma.module';

import { PrismaTeamRepository } from './repositories/prisma-team.repository';
import { TEAM_REPOSITORY } from './repositories/team-repository.interface';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [PrismaModule],
  controllers: [TeamController],
  providers: [
    TeamService,
    { provide: TEAM_REPOSITORY, useClass: PrismaTeamRepository },
  ],
  exports: [TeamService],
})
export class TeamModule {}
