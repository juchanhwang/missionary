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

import { CreateMissionaryPosterDto } from './dto/create-missionary-poster.dto';
import { CreateMissionaryRegionDto } from './dto/create-missionary-region.dto';
import { CreateMissionaryDto } from './dto/create-missionary.dto';
import { UpdateMissionaryDto } from './dto/update-missionary.dto';
import { MissionaryService } from './missionary.service';

@ApiTags('Missionaries')
@Controller('missionaries')
export class MissionaryController {
  constructor(private readonly missionaryService: MissionaryService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 생성 (관리자 전용)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMissionaryDto,
  ) {
    return this.missionaryService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '선교 목록 조회' })
  findAll() {
    return this.missionaryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '선교 단건 조회' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.missionaryService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 수정 (관리자 전용)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMissionaryDto,
  ) {
    return this.missionaryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 삭제 (관리자 전용)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.missionaryService.remove(id);
  }

  @Post(':id/regions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 연계지 추가 (관리자 전용)' })
  addRegion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMissionaryRegionDto,
  ) {
    return this.missionaryService.addRegion(id, dto);
  }

  @Get(':id/regions')
  @ApiOperation({ summary: '선교 연계지 목록 조회' })
  getRegions(@Param('id', ParseUUIDPipe) id: string) {
    return this.missionaryService.getRegions(id);
  }

  @Delete(':id/regions/:regionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 연계지 제거 (관리자 전용)' })
  removeRegion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('regionId', ParseUUIDPipe) regionId: string,
  ) {
    return this.missionaryService.removeRegion(id, regionId);
  }

  @Post(':id/posters')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 포스터 추가 (관리자 전용)' })
  addPoster(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMissionaryPosterDto,
  ) {
    return this.missionaryService.addPoster(id, dto);
  }

  @Get(':id/posters')
  @ApiOperation({ summary: '선교 포스터 목록 조회' })
  getPosters(@Param('id', ParseUUIDPipe) id: string) {
    return this.missionaryService.getPosters(id);
  }

  @Delete(':id/posters/:posterId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '선교 포스터 제거 (관리자 전용)' })
  removePoster(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('posterId', ParseUUIDPipe) posterId: string,
  ) {
    return this.missionaryService.removePoster(id, posterId);
  }
}
