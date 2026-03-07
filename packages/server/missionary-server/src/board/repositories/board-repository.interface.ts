import type { MissionaryBoardType } from '@/common/enums/missionary-board-type.enum';
import type { BaseRepository } from '@/common/repositories';

import type {
  Missionary,
  MissionaryBoard,
  Prisma,
} from '../../../prisma/generated/prisma';

export interface BoardWithRelations extends MissionaryBoard {
  missionary: Missionary;
}

export type BoardCreateInput = Prisma.MissionaryBoardUncheckedCreateInput;

export type BoardUpdateInput = Prisma.MissionaryBoardUncheckedUpdateInput;

export interface BoardRepository extends BaseRepository<
  MissionaryBoard,
  BoardCreateInput,
  BoardUpdateInput
> {
  createWithRelations(data: BoardCreateInput): Promise<BoardWithRelations>;
  findByMissionary(
    missionaryId: string,
    type?: MissionaryBoardType,
  ): Promise<BoardWithRelations[]>;
  findByIdWithRelations(id: string): Promise<BoardWithRelations | null>;
  updateWithRelations(
    id: string,
    data: BoardUpdateInput,
  ): Promise<BoardWithRelations>;
  deleteWithRelations(id: string): Promise<BoardWithRelations>;
}

export const BOARD_REPOSITORY = Symbol('BOARD_REPOSITORY');
