import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { MissionService } from './mission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Missions')
@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Post()
  @ApiOperation({ summary: '선교 생성' })
  create(@Req() req: Request, @Body() dto: CreateMissionDto) {
    const user = req.user as {
      id: number;
      email: string;
      role: string;
      provider: string;
    };
    return this.missionService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '선교 목록 조회' })
  findAll() {
    return this.missionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '선교 단건 조회' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.missionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '선교 수정' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMissionDto) {
    return this.missionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '선교 삭제' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.missionService.remove(id);
  }
}
