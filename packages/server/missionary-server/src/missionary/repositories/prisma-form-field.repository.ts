import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import {
  Prisma,
  type MissionaryFormField,
} from '../../../prisma/generated/prisma';

import type {
  FormFieldCreateInput,
  FormFieldRepository,
  FormFieldUpdateInput,
} from './form-field-repository.interface';

@Injectable()
export class PrismaFormFieldRepository implements FormFieldRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toNullableJson(
    value: Prisma.InputJsonValue | null | undefined,
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (value === undefined) return undefined;
    if (value === null) return Prisma.JsonNull;
    return value;
  }

  async create(data: FormFieldCreateInput): Promise<MissionaryFormField> {
    return this.prisma.missionaryFormField.create({
      data: {
        ...data,
        options: this.toNullableJson(data.options),
      },
    });
  }

  async findByMissionary(missionaryId: string): Promise<MissionaryFormField[]> {
    return this.prisma.missionaryFormField.findMany({
      where: { missionaryId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<MissionaryFormField | null> {
    return this.prisma.missionaryFormField.findFirst({ where: { id } });
  }

  async update(
    id: string,
    data: FormFieldUpdateInput,
  ): Promise<MissionaryFormField> {
    return this.prisma.missionaryFormField.update({
      where: { id },
      data: {
        ...data,
        options: this.toNullableJson(data.options),
        version: { increment: 1 },
      },
    });
  }

  async delete(id: string): Promise<MissionaryFormField> {
    return this.prisma.missionaryFormField.delete({ where: { id } });
  }
}
