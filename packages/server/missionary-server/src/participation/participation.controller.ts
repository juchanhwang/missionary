import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Response,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';

import { ApprovePaymentDto } from './dto/approve-payment.dto';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateFormAnswersDto } from './dto/update-form-answers.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { ParticipationService, FindAllFilters } from './participation.service';

@ApiTags('Participations')
@Controller('participations')
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @Post()
  @ApiOperation({ summary: '참가 신청 생성 (비동기 처리)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateParticipationDto,
  ) {
    return this.participationService.create(dto, user.id);
  }

  @Put('approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '참가비 납부 승인 (관리자 전용)' })
  approvePayments(@Body() dto: ApprovePaymentDto) {
    return this.participationService.approvePayments(dto.participationIds);
  }

  @Get('enrollment-summary/:missionaryId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: '등록 현황 요약 조회 (관리자/스태프 전용)' })
  getEnrollmentSummary(
    @Param('missionaryId', ParseUUIDPipe) missionaryId: string,
  ) {
    return this.participationService.getEnrollmentSummary(missionaryId);
  }

  @Get('download/:missionaryId')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: '참가 신청 CSV 다운로드 (관리자/스태프 전용)' })
  async downloadCsv(
    @Param('missionaryId', ParseUUIDPipe) missionaryId: string,
    @Response() res: ExpressResponse,
  ) {
    const csvBuffer =
      await this.participationService.generateCsvBuffer(missionaryId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="participations-${missionaryId}.csv"`,
    );
    res.send(csvBuffer);
  }

  @Get()
  @ApiOperation({ summary: '참가 신청 목록 조회' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('missionaryId') missionaryId?: string,
    @Query('isPaid') isPaid?: string,
    @Query('attendanceType') attendanceType?: string,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: FindAllFilters = {};

    if (missionaryId) filters.missionaryId = missionaryId;
    if (isPaid !== undefined) filters.isPaid = isPaid === 'true';
    if (attendanceType === 'FULL' || attendanceType === 'PARTIAL') {
      filters.attendanceType = attendanceType;
    }
    if (query) filters.query = query;
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.STAFF) {
      filters.userId = user.id;
    }

    return this.participationService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: '참가 신청 단건 조회' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.participationService.findOne(id);
  }

  @Patch(':id/answers')
  @ApiOperation({ summary: '커스텀 필드 답변 일괄 저장' })
  updateAnswers(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFormAnswersDto,
  ) {
    return this.participationService.updateAnswers(id, dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '참가 신청 수정' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParticipationDto,
  ) {
    return this.participationService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '참가 신청 삭제' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.participationService.remove(id, user);
  }
}
