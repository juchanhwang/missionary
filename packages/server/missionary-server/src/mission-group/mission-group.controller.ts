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

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

import { CreateMissionGroupDto } from './dto/create-mission-group.dto';
import { UpdateMissionGroupDto } from './dto/update-mission-group.dto';
import { MissionGroupService } from './mission-group.service';

@ApiTags('MissionGroups')
@Controller('mission-groups')
export class MissionGroupController {
  constructor(private readonly missionGroupService: MissionGroupService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 그룹 생성 (관리자 전용)' })
  create(@Body() createMissionGroupDto: CreateMissionGroupDto) {
    return this.missionGroupService.create(createMissionGroupDto);
  }

  @Get()
  @ApiOperation({ summary: '전체 선교 그룹 조회' })
  findAll() {
    return this.missionGroupService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '선교 그룹 단건 조회' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.missionGroupService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 그룹 정보 수정 (관리자 전용)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMissionGroupDto: UpdateMissionGroupDto,
  ) {
    return this.missionGroupService.update(id, updateMissionGroupDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 그룹 삭제 (관리자 전용)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.missionGroupService.remove(id);
  }
}
