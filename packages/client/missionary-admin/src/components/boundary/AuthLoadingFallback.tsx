'use client';

import { LoadingSpinner } from '../loading/LoadingSpinner';

export function AuthLoadingFallback() {
  return (
    <LoadingSpinner fullscreen message="인증 정보를 불러오는 중입니다" />
  );
}
