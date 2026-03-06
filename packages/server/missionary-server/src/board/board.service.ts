import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { MissionaryBoardType } from '@/common/enums/missionary-board-type.enum';

import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import {
  BOARD_REPOSITORY,
  type BoardRepository,
  type BoardUpdateInput,
} from './repositories/board-repository.interface';

@Injectable()
export class BoardService {
  constructor(
    @Inject(BOARD_REPOSITORY)
    private readonly boardRepository: BoardRepository,
  ) {}

  async create(dto: CreateBoardDto) {
    return this.boardRepository.createWithRelations({
      missionaryId: dto.missionaryId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
    });
  }

  async findByMissionary(missionaryId: string, type?: MissionaryBoardType) {
    return this.boardRepository.findByMissionary(missionaryId, type);
  }

  async findOne(id: string) {
    const board = await this.boardRepository.findByIdWithRelations(id);

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }

  async update(id: string, dto: UpdateBoardDto) {
    await this.findOne(id);

    const data: BoardUpdateInput = {};

    if (dto.type !== undefined) data.type = dto.type;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;

    return this.boardRepository.updateWithRelations(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.boardRepository.deleteWithRelations(id);
  }
}
