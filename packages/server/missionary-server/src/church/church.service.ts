import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import {
  CHURCH_REPOSITORY,
  type ChurchRepository,
} from './repositories/church-repository.interface';

@Injectable()
export class ChurchService {
  constructor(
    @Inject(CHURCH_REPOSITORY)
    private readonly churchRepository: ChurchRepository,
  ) {}

  async create(createChurchDto: CreateChurchDto) {
    return this.churchRepository.create(createChurchDto);
  }

  async findAll() {
    return this.churchRepository.findAll();
  }

  async findOne(id: string) {
    const church = await this.churchRepository.findById(id);

    if (!church) {
      throw new NotFoundException(`Church #${id}을 찾을 수 없습니다`);
    }

    return church;
  }

  async update(id: string, updateChurchDto: UpdateChurchDto) {
    await this.findOne(id); // Verify exists

    return this.churchRepository.update({ id }, updateChurchDto);
  }

  async remove(id: string) {
    await this.findOne(id); // Verify exists

    return this.churchRepository.delete({ id });
  }
}
