import { SetMetadata } from '@nestjs/common';

export const SKIP_MASKING_KEY = 'skipMasking';

/**
 * ADMIN 역할일 때 지정된 PII 필드의 마스킹을 해제한다.
 * 필드를 지정하지 않으면 identityNumber, phoneNumber를 기본 해제한다.
 */
export const SkipMasking = (...fields: string[]) =>
  SetMetadata(
    SKIP_MASKING_KEY,
    fields.length > 0 ? fields : ['identityNumber', 'phoneNumber'],
  );
