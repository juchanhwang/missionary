import { Logger } from '@nestjs/common';

const logger = new Logger('RetryUtil');

/**
 * Prisma/pg에서 발생하는 transient DB 연결 에러인지 판별한다.
 * - 인증 실패 (credentials not valid)
 * - 연결 끊김 (connection terminated / refused / reset)
 * - 타임아웃 (connection timed out)
 */
function isTransientDbError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const transientPatterns = [
    'credentials',
    'authentication failed',
    'connection terminated',
    'connection refused',
    'connection reset',
    'connection timed out',
    'econnrefused',
    'econnreset',
    'etimedout',
    'too many clients',
    'remaining connection slots',
    'server closed the connection unexpectedly',
  ];

  return transientPatterns.some((pattern) => message.includes(pattern));
}

const DEFAULT_MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

/**
 * transient DB 에러 발생 시 지수 백오프로 재시도한다.
 * 비즈니스 로직 에러(NotFoundException, UnauthorizedException 등)는 재시도하지 않는다.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  context?: string,
  maxRetries: number = DEFAULT_MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isTransientDbError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      logger.warn(
        `DB 연결 에러 감지, ${delay}ms 후 재시도 (${attempt + 1}/${maxRetries})${context ? ` [${context}]` : ''}: ${error instanceof Error ? error.message : String(error)}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
