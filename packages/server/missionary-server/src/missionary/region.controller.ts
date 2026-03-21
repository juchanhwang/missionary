import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

import { GetRegionsQueryDto } from './dto/get-regions-query.dto';
import { MissionaryService } from './missionary.service';

@ApiTags('Regions')
@Controller('regions')
export class RegionController {
  constructor(private readonly missionaryService: MissionaryService) {}

  @Get()
  @ApiOperation({ summary: '전체 연계지 목록 조회 (필터/검색)' })
  findAll(@Query() query: GetRegionsQueryDto) {
    return this.missionaryService.findAllRegions(query);
  }

  @Get('deleted')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '삭제된 연계지 목록 조회 (관리자 전용)' })
  findDeleted(@Query() query: GetRegionsQueryDto) {
    return this.missionaryService.findDeletedRegions(query);
  }
}
