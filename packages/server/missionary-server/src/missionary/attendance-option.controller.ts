import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';

import { AttendanceOptionService } from './attendance-option.service';
import { CreateAttendanceOptionDto } from './dto/create-attendance-option.dto';
import { UpdateAttendanceOptionDto } from './dto/update-attendance-option.dto';

@ApiTags('Attendance Options')
@Controller('missionaries/:missionaryId/attendance-options')
export class AttendanceOptionController {
  constructor(private readonly service: AttendanceOptionService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '참석 옵션 추가 (관리자 전용)' })
  create(
    @Param('missionaryId', ParseUUIDPipe) missionaryId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAttendanceOptionDto,
  ) {
    return this.service.create(missionaryId, dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '참석 옵션 목록 조회' })
  findAll(@Param('missionaryId', ParseUUIDPipe) missionaryId: string) {
    return this.service.findByMissionary(missionaryId);
  }

  @Patch(':optionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '참석 옵션 수정 (관리자 전용)' })
  update(
    @Param('optionId', ParseUUIDPipe) optionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAttendanceOptionDto,
  ) {
    return this.service.update(optionId, dto, user.id);
  }

  @Delete(':optionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '참석 옵션 삭제 (관리자 전용)' })
  remove(@Param('optionId', ParseUUIDPipe) optionId: string) {
    return this.service.remove(optionId);
  }
}
