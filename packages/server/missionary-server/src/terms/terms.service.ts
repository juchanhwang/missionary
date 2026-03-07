import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateAgreementDto } from './dto/create-agreement.dto';
import { CreateTermsDto } from './dto/create-terms.dto';
import { UpdateTermsDto } from './dto/update-terms.dto';
import { TERMS_AGREEMENT_REPOSITORY } from './repositories/terms-agreement-repository.interface';
import { TERMS_REPOSITORY } from './repositories/terms-repository.interface';

import type { TermsAgreementRepository } from './repositories/terms-agreement-repository.interface';
import type { TermsRepository } from './repositories/terms-repository.interface';

@Injectable()
export class TermsService {
  constructor(
    @Inject(TERMS_REPOSITORY)
    private readonly termsRepository: TermsRepository,
    @Inject(TERMS_AGREEMENT_REPOSITORY)
    private readonly termsAgreementRepository: TermsAgreementRepository,
  ) {}

  async create(dto: CreateTermsDto) {
    return this.termsRepository.create(dto);
  }

  async findAll() {
    return this.termsRepository.findAllActive();
  }

  async findOne(id: string) {
    const terms = await this.termsRepository.findById(id);

    if (!terms) {
      throw new NotFoundException(`Terms #${id}을 찾을 수 없습니다`);
    }

    return terms;
  }

  async update(id: string, dto: UpdateTermsDto) {
    await this.findOne(id);

    return this.termsRepository.update({ id }, dto);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.termsRepository.delete({ id });
  }

  async createAgreement(termsId: string, dto: CreateAgreementDto) {
    await this.findOne(termsId);

    const existing = await this.termsAgreementRepository.findByTermsAndUser(
      termsId,
      dto.userId,
    );

    if (existing) {
      throw new ConflictException('이미 동의한 약관입니다');
    }

    return this.termsAgreementRepository.createWithRelations({
      termsId,
      userId: dto.userId,
      isAgreed: dto.isAgreed ?? true,
    });
  }

  async getUserAgreements(userId: string) {
    return this.termsAgreementRepository.findByUser(userId);
  }
}
