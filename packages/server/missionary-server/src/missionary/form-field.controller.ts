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

import { CreateFormFieldDto } from './dto/create-form-field.dto';
import { UpdateFormFieldDto } from './dto/update-form-field.dto';
import { FormFieldService } from './form-field.service';

@ApiTags('Form Fields')
@Controller('missionaries/:missionaryId/form-fields')
export class FormFieldController {
  constructor(private readonly service: FormFieldService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '커스텀 폼 필드 추가 (관리자 전용)' })
  create(
    @Param('missionaryId', ParseUUIDPipe) missionaryId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFormFieldDto,
  ) {
    return this.service.create(missionaryId, dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '커스텀 폼 필드 목록 조회' })
  findAll(@Param('missionaryId', ParseUUIDPipe) missionaryId: string) {
    return this.service.findByMissionary(missionaryId);
  }

  @Patch(':fieldId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '커스텀 폼 필드 수정 (관리자 전용)' })
  update(
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateFormFieldDto,
  ) {
    return this.service.update(fieldId, dto, user.id);
  }

  @Delete(':fieldId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '커스텀 폼 필드 삭제 (관리자 전용)' })
  remove(@Param('fieldId', ParseUUIDPipe) fieldId: string) {
    return this.service.remove(fieldId);
  }
}
