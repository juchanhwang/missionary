import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

function isDbConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('credentials') ||
    msg.includes('authentication failed') ||
    msg.includes('connection terminated') ||
    msg.includes('connection refused') ||
    msg.includes('econnrefused')
  );
}

@Injectable()
@Catch()
export class OAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    let message: string;

    if (isDbConnectionError(exception)) {
      message = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      this.logger.error(
        `OAuth 중 DB 연결 에러 발생`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (exception instanceof HttpException) {
      message = exception.message;
      this.logger.error(`OAuth 인증 실패: ${message}`);
    } else {
      message = 'OAuth 인증 중 알 수 없는 오류가 발생했습니다';
      this.logger.error(
        `OAuth 인증 실패: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const clientUrl = this.configService.get<string>(
      'ADMIN_CLIENT_URL',
      'http://localhost:3001',
    );

    const errorParam = encodeURIComponent(message);
    res.redirect(`${clientUrl}/login?error=${errorParam}`);
  }
}
