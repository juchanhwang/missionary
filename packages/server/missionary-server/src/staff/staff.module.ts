import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma.module';

import { PrismaStaffRepository } from './repositories/prisma-staff.repository';
import { STAFF_REPOSITORY } from './repositories/staff-repository.interface';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController],
  providers: [
    StaffService,
    { provide: STAFF_REPOSITORY, useClass: PrismaStaffRepository },
  ],
  exports: [StaffService],
})
export class StaffModule {}
