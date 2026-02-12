import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';

import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthExceptionFilter } from './filters/oauth-exception.filter';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private get cookieOptions() {
    const isSecure = this.configService.get<string>('COOKIE_SECURE') === 'true';

    return {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? ('none' as const) : ('lax' as const),
      path: '/',
    };
  }

  private setTokenCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
    const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

    res.cookie('access_token', tokens.accessToken, {
      ...this.cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      ...this.cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'ID/PW 로그인' })
  login(
    @Body() _loginDto: LoginDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = this.authService.generateTokens(user);

    this.setTokenCookies(res, tokens);

    return { message: '로그인 성공' };
  }

  @Public()
  @Post('admin/login')
  @ApiOperation({ summary: '관리자 로그인 (loginId/password)' })
  async adminLogin(
    @Body() adminLoginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.loginAdmin(adminLoginDto);

    this.setTokenCookies(res, tokens);

    return { message: '관리자 로그인 성공' };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  @ApiOperation({ summary: 'Google OAuth 로그인 시작' })
  googleLogin() {
    // GoogleAuthGuard가 리다이렉트 처리
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  @ApiOperation({ summary: 'Google OAuth 콜백' })
  googleCallback(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tokens = this.authService.generateTokens(user);

    this.setTokenCookies(res, tokens);

    const state = req.query.state as string | undefined;
    const clientUrl =
      state === 'app'
        ? this.configService.get<string>(
            'APP_CLIENT_URL',
            'http://localhost:3000',
          )
        : this.configService.get<string>(
            'ADMIN_CLIENT_URL',
            'http://localhost:3001',
          );
    res.redirect(clientUrl);
  }

  @Public()
  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  @ApiOperation({ summary: 'Kakao OAuth 로그인 시작' })
  kakaoLogin() {
    // KakaoAuthGuard가 리다이렉트 처리
  }

  @Public()
  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  @UseFilters(OAuthExceptionFilter)
  @ApiOperation({ summary: 'Kakao OAuth 콜백' })
  kakaoCallback(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tokens = this.authService.generateTokens(user);

    this.setTokenCookies(res, tokens);

    const state = req.query.state as string | undefined;
    const clientUrl =
      state === 'app'
        ? this.configService.get<string>(
            'APP_CLIENT_URL',
            'http://localhost:3000',
          )
        : this.configService.get<string>(
            'ADMIN_CLIENT_URL',
            'http://localhost:3001',
          );
    res.redirect(clientUrl);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다');
    }

    const tokens = await this.authService.refreshAccessToken(refreshToken);

    this.setTokenCookies(res, tokens);

    return { message: '토큰 갱신 성공' };
  }

  @Patch('change-password')
  @ApiOperation({ summary: '비밀번호 변경' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: '현재 로그인 사용자 정보 조회' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', this.cookieOptions);
    res.clearCookie('refresh_token', this.cookieOptions);

    return { message: '로그아웃 성공' };
  }
}
