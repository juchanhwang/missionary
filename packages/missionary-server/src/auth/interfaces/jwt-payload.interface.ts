export interface JwtPayload {
  sub: number;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  provider: 'LOCAL' | 'GOOGLE' | 'KAKAO';
}
