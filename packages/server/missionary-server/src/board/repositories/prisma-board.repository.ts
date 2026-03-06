import { Injectable } from '@nestjs/common';

import type { MissionaryBoardType } from '@/common/enums/missionary-board-type.enum';
import { PrismaService } from '@/database/prisma.service';

import type {
  BoardCreateInput,
  BoardRepository,
  BoardUpdateInput,
  BoardWithRelations,
} from './board-repository.interface';
import type { MissionaryBoard } from '../../../prisma/generated/prisma';

const BOARD_INCLUDE = {
  missionary: true,
} as const;

@Injectable()
export class PrismaBoardRepository implements BoardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: BoardCreateInput): Promise<MissionaryBoard> {
    return this.prisma.missionaryBoard.create({ data });
  }

  async findMany(args?: {
    where?: Partial<MissionaryBoard>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<MissionaryBoard[]> {
    return this.prisma.missionaryBoard.findMany({
      where: args?.where,
      orderBy: args?.orderBy,
    });
  }

  async findUnique(
    where: Partial<MissionaryBoard>,
  ): Promise<MissionaryBoard | null> {
    return this.prisma.missionaryBoard.findUnique({
      where: where as { id: string },
    });
  }

  async findFirst(
    where: Partial<MissionaryBoard>,
  ): Promise<MissionaryBoard | null> {
    return this.prisma.missionaryBoard.findFirst({ where });
  }

  async update(
    where: Partial<MissionaryBoard>,
    data: BoardUpdateInput,
  ): Promise<MissionaryBoard> {
    return this.prisma.missionaryBoard.update({
      where: where as { id: string },
      data,
    });
  }

  async delete(where: Partial<MissionaryBoard>): Promise<MissionaryBoard> {
    return this.prisma.missionaryBoard.delete({
      where: where as { id: string },
    });
  }

  async count(where?: Partial<MissionaryBoard>): Promise<number> {
    return this.prisma.missionaryBoard.count({ where });
  }

  async createWithRelations(
    data: BoardCreateInput,
  ): Promise<BoardWithRelations> {
    return this.prisma.missionaryBoard.create({
      data,
      include: BOARD_INCLUDE,
    });
  }

  async findByMissionary(
    missionaryId: string,
    type?: MissionaryBoardType,
  ): Promise<BoardWithRelations[]> {
    return this.prisma.missionaryBoard.findMany({
      where: { missionaryId, type },
      include: BOARD_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdWithRelations(id: string): Promise<BoardWithRelations | null> {
    return this.prisma.missionaryBoard.findUnique({
      where: { id },
      include: BOARD_INCLUDE,
    });
  }

  async updateWithRelations(
    id: string,
    data: BoardUpdateInput,
  ): Promise<BoardWithRelations> {
    return this.prisma.missionaryBoard.update({
      where: { id },
      data,
      include: BOARD_INCLUDE,
    });
  }

  async deleteWithRelations(id: string): Promise<BoardWithRelations> {
    return this.prisma.missionaryBoard.delete({
      where: { id },
      include: BOARD_INCLUDE,
    });
  }
}
