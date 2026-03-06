export { PrismaTermsRepository } from './prisma-terms.repository';
export type {
  TermsRepository,
  TermsCreateInput,
  TermsUpdateInput,
} from './terms-repository.interface';
export { TERMS_REPOSITORY } from './terms-repository.interface';

export { PrismaTermsAgreementRepository } from './prisma-terms-agreement.repository';
export type {
  TermsAgreementRepository,
  AgreementWithRelations,
  AgreementCreateInput,
} from './terms-agreement-repository.interface';
export { TERMS_AGREEMENT_REPOSITORY } from './terms-agreement-repository.interface';
