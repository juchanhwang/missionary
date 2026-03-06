import type {
  Terms,
  UserTermsAgreement,
} from '../../../prisma/generated/prisma';

export interface AgreementWithRelations extends UserTermsAgreement {
  terms: Terms;
  user?: { id: string; email: string | null; name: string | null };
}

export interface AgreementCreateInput {
  termsId: string;
  userId: string;
  isAgreed?: boolean;
}

export interface TermsAgreementRepository {
  findByTermsAndUser(
    termsId: string,
    userId: string,
  ): Promise<UserTermsAgreement | null>;
  createWithRelations(
    data: AgreementCreateInput,
  ): Promise<AgreementWithRelations>;
  findByUser(userId: string): Promise<AgreementWithRelations[]>;
}

export const TERMS_AGREEMENT_REPOSITORY = Symbol('TERMS_AGREEMENT_REPOSITORY');
