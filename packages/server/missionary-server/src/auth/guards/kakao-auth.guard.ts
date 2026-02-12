import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');

    if (!clientId) {
      throw new UnauthorizedException(
        'Kakao OAuth가 설정되지 않았습니다. KAKAO_CLIENT_ID를 확인해주세요.',
      );
    }

    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const client = (request.query.client as string) || 'admin';
    return { state: client };
  }
}
