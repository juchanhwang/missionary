import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import {
  PASSWORD_HASHER,
  PasswordHasher,
} from '@/common/interfaces/password-hasher.interface';
import { makeUser } from '@/testing/factories/user.factory';
import { UserService } from '@/user/user.service';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  let mockPasswordHasher: jest.Mocked<PasswordHasher>;

  beforeEach(async () => {
    const mockUserService = {
      findByEmail: jest.fn(),
      findByProvider: jest.fn(),
      createOAuthUser: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByLoginIdAndRole: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        return undefined;
      }),
    };

    const mockPasswordHasherValue = {
      hash: jest.fn().mockImplementation((data: string) => `hashed-${data}`),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasherValue },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;

    mockPasswordHasher = module.get(
      PASSWORD_HASHER,
    ) as jest.Mocked<PasswordHasher>;
  });

  it('서비스가 정의되어 있다', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('JWT 페이로드에 역할이 포함된다', () => {
      const user = makeUser({ role: 'ADMIN', provider: 'LOCAL' });

      jwtService.sign.mockReturnValueOnce('mock-access-token');
      jwtService.sign.mockReturnValueOnce('mock-refresh-token');

      const tokens = service.generateTokens(user);

      expect(tokens).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          role: user.role,
          provider: user.provider,
        }),
        expect.any(Object),
      );
    });

    it('액세스 토큰이 올바른 만료 시간으로 생성된다', () => {
      const user = makeUser({ provider: 'GOOGLE' });

      jwtService.sign.mockReturnValue('mock-token');

      service.generateTokens(user);

      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.any(Object),
        expect.objectContaining({
          secret: 'test-secret',
          expiresIn: 15 * 60,
        }),
      );
    });

    it('리프레시 토큰이 올바른 만료 시간으로 생성된다', () => {
      const user = makeUser({ provider: 'KAKAO' });

      jwtService.sign.mockReturnValue('mock-token');

      service.generateTokens(user);

      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.any(Object),
        expect.objectContaining({
          secret: 'test-refresh-secret',
          expiresIn: 7 * 24 * 60 * 60,
        }),
      );
    });
  });

  describe('loginAdmin', () => {
    const adminLoginDto = {
      loginId: 'admin',
      password: 'password123',
    };

    it('유효한 자격 증명으로 관리자 로그인에 성공한다', async () => {
      const adminUser = makeUser({
        role: 'ADMIN',
        loginId: 'admin',
        password: 'hashed-password123',
      });

      userService.findByLoginIdAndRole.mockResolvedValueOnce(adminUser);
      mockPasswordHasher.compare.mockResolvedValueOnce(true);
      jwtService.sign.mockReturnValueOnce('mock-access-token');
      jwtService.sign.mockReturnValueOnce('mock-refresh-token');

      const result = await service.loginAdmin(adminLoginDto);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      expect(userService.findByLoginIdAndRole).toHaveBeenCalledWith(
        'admin',
        'ADMIN',
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        'password123',
        adminUser.password,
      );
    });

    it('잘못된 비밀번호로 로그인하면 UnauthorizedException을 던진다', async () => {
      const adminUser = makeUser({
        role: 'ADMIN',
        loginId: 'admin',
        password: 'hashed-correct-password',
      });

      userService.findByLoginIdAndRole.mockResolvedValueOnce(adminUser);
      mockPasswordHasher.compare.mockResolvedValueOnce(false);

      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      userService.findByLoginIdAndRole.mockResolvedValueOnce(adminUser);
      mockPasswordHasher.compare.mockResolvedValueOnce(false);

      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow(
        '관리자 인증에 실패했습니다',
      );
    });

    it('존재하지 않는 로그인 ID로 로그인하면 UnauthorizedException을 던진다', async () => {
      userService.findByLoginIdAndRole.mockResolvedValueOnce(null);

      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      userService.findByLoginIdAndRole.mockResolvedValueOnce(null);

      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow(
        '관리자 인증에 실패했습니다',
      );
    });

    it('비밀번호가 없는 사용자로 로그인하면 UnauthorizedException을 던진다', async () => {
      const adminUserNoPassword = makeUser({
        role: 'ADMIN',
        loginId: 'admin',
        password: null,
      });

      userService.findByLoginIdAndRole.mockResolvedValueOnce(
        adminUserNoPassword,
      );

      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      userService.findByLoginIdAndRole.mockResolvedValueOnce(
        adminUserNoPassword,
      );

      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow(
        '관리자 인증에 실패했습니다',
      );
    });

    it('ADMIN 역할의 사용자만 조회한다', async () => {
      userService.findByLoginIdAndRole.mockResolvedValueOnce(null);

      await expect(service.loginAdmin(adminLoginDto)).rejects.toThrow();

      expect(userService.findByLoginIdAndRole).toHaveBeenCalledWith(
        'admin',
        'ADMIN',
      );
    });
  });

  describe('validateLocalUser', () => {
    it('올바른 이메일과 비밀번호로 사용자를 인증한다', async () => {
      const user = makeUser({ password: 'hashed-password123' });

      userService.findByEmail.mockResolvedValueOnce(user);
      mockPasswordHasher.compare.mockResolvedValueOnce(true);

      const result = await service.validateLocalUser(
        user.email!,
        'password123',
      );

      expect(result).toEqual(user);
    });

    it('잘못된 비밀번호로 로그인하면 UnauthorizedException을 던진다', async () => {
      const user = makeUser({ password: 'hashed-correct-password' });

      userService.findByEmail.mockResolvedValueOnce(user);
      mockPasswordHasher.compare.mockResolvedValueOnce(false);

      await expect(
        service.validateLocalUser(user.email!, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('존재하지 않는 이메일로 로그인하면 UnauthorizedException을 던진다', async () => {
      userService.findByEmail.mockResolvedValueOnce(null);

      await expect(
        service.validateLocalUser('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateOAuthUser', () => {
    it('기존 OAuth 사용자가 있으면 해당 사용자를 반환한다', async () => {
      const existingUser = makeUser({
        provider: 'GOOGLE',
        providerId: 'google-id-123',
      });

      userService.findByProvider.mockResolvedValueOnce(existingUser);

      const result = await service.validateOAuthUser(
        'GOOGLE',
        'google-id-123',
        existingUser.email!,
        existingUser.name!,
      );

      expect(result).toEqual(existingUser);
      expect(userService.findByProvider).toHaveBeenCalledWith(
        'GOOGLE',
        'google-id-123',
      );
      expect(userService.findByEmail).not.toHaveBeenCalled();
    });

    it('provider로 찾을 수 없지만 이메일로 기존 사용자가 있으면 해당 사용자를 반환한다', async () => {
      const existingUser = makeUser({ provider: 'LOCAL' });

      userService.findByProvider.mockResolvedValueOnce(null);
      userService.findByEmail.mockResolvedValueOnce(existingUser);

      const result = await service.validateOAuthUser(
        'GOOGLE',
        'google-id-456',
        existingUser.email!,
        existingUser.name!,
      );

      expect(result).toEqual(existingUser);
      expect(userService.findByEmail).toHaveBeenCalledWith(existingUser.email);
      expect(userService.createOAuthUser).not.toHaveBeenCalled();
    });

    it('기존 사용자가 없으면 새 OAuth 사용자를 생성한다', async () => {
      const newUser = makeUser({
        provider: 'KAKAO',
        providerId: 'kakao-id-789',
      });

      userService.findByProvider.mockResolvedValueOnce(null);
      userService.findByEmail.mockResolvedValueOnce(null);
      userService.createOAuthUser.mockResolvedValueOnce(newUser);

      const result = await service.validateOAuthUser(
        'KAKAO',
        'kakao-id-789',
        newUser.email!,
        newUser.name!,
      );

      expect(result).toEqual(newUser);
      expect(userService.createOAuthUser).toHaveBeenCalledWith({
        email: newUser.email,
        name: newUser.name,
        provider: 'KAKAO',
        providerId: 'kakao-id-789',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('유효한 리프레시 토큰으로 새 토큰을 생성한다', async () => {
      const user = makeUser();
      const payload = {
        sub: user.id,
        email: user.email,
        role: 'USER' as const,
        provider: 'LOCAL' as const,
      };

      jwtService.verify.mockReturnValueOnce(payload);
      userService.findOne.mockResolvedValueOnce(user);
      jwtService.sign.mockReturnValueOnce('new-access-token');
      jwtService.sign.mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshAccessToken('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-refresh-secret',
      });
    });

    it('유효하지 않은 리프레시 토큰이면 UnauthorizedException을 던진다', async () => {
      jwtService.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('비밀번호를 정상적으로 변경한다', async () => {
      const user = makeUser({ password: 'hashed-current-password' });
      const changePasswordDto = {
        currentPassword: 'current-password',
        newPassword: 'new-password-123',
      };

      userService.findOne.mockResolvedValueOnce(user);
      mockPasswordHasher.compare.mockResolvedValueOnce(true);
      mockPasswordHasher.hash.mockResolvedValueOnce('hashed-new-password-123');
      userService.updatePassword.mockResolvedValueOnce(undefined);

      const result = await service.changePassword(user.id, changePasswordDto);

      expect(result).toEqual({ message: '비밀번호가 변경되었습니다' });
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        'current-password',
        user.password,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('new-password-123');
      expect(userService.updatePassword).toHaveBeenCalledWith(
        user.id,
        'hashed-new-password-123',
      );
    });

    it('OAuth 계정의 비밀번호를 변경하려고 하면 BadRequestException을 던진다', async () => {
      const oauthUser = makeUser({
        provider: 'GOOGLE',
        password: null,
      });
      const changePasswordDto = {
        currentPassword: 'current-password',
        newPassword: 'new-password-123',
      };

      userService.findOne.mockResolvedValueOnce(oauthUser);

      await expect(
        service.changePassword(oauthUser.id, changePasswordDto),
      ).rejects.toThrow(BadRequestException);

      userService.findOne.mockResolvedValueOnce(oauthUser);

      await expect(
        service.changePassword(oauthUser.id, changePasswordDto),
      ).rejects.toThrow('OAuth 계정은 비밀번호를 변경할 수 없습니다');
    });

    it('현재 비밀번호가 일치하지 않으면 UnauthorizedException을 던진다', async () => {
      const user = makeUser({ password: 'hashed-current-password' });
      const changePasswordDto = {
        currentPassword: 'wrong-password',
        newPassword: 'new-password-123',
      };

      userService.findOne.mockResolvedValueOnce(user);
      mockPasswordHasher.compare.mockResolvedValueOnce(false);

      await expect(
        service.changePassword(user.id, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);

      userService.findOne.mockResolvedValueOnce(user);
      mockPasswordHasher.compare.mockResolvedValueOnce(false);

      await expect(
        service.changePassword(user.id, changePasswordDto),
      ).rejects.toThrow('현재 비밀번호가 올바르지 않습니다');
    });
  });
});
