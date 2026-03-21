import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

import { CreateMissionaryRegionDto } from './dto/create-missionary-region.dto';
import { UpdateMissionaryRegionDto } from './dto/update-missionary-region.dto';
import { MissionaryService } from './missionary.service';

@ApiTags('Regions')
@Controller('mission-groups')
export class MissionGroupRegionController {
  constructor(private readonly missionaryService: MissionaryService) {}

  @Post(':id/regions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 그룹 연계지 추가 (관리자 전용)' })
  addRegion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMissionaryRegionDto,
  ) {
    return this.missionaryService.addRegion(id, dto);
  }

  @Patch(':id/regions/:regionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 그룹 연계지 수정 (관리자 전용)' })
  updateRegion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('regionId', ParseUUIDPipe) regionId: string,
    @Body() dto: UpdateMissionaryRegionDto,
  ) {
    return this.missionaryService.updateRegion(id, regionId, dto);
  }

  @Delete(':id/regions/:regionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 그룹 연계지 제거 (관리자 전용)' })
  removeRegion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('regionId', ParseUUIDPipe) regionId: string,
  ) {
    return this.missionaryService.removeRegion(id, regionId);
  }

  @Patch(':id/regions/:regionId/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '삭제된 연계지 복구 (관리자 전용)' })
  restoreRegion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('regionId', ParseUUIDPipe) regionId: string,
  ) {
    return this.missionaryService.restoreRegion(id, regionId);
  }
}
