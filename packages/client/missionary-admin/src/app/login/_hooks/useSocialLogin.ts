const SOCIAL_AUTH_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? '/api'
    : (process.env.NEXT_PUBLIC_API_URL ?? '/api');

export function useSocialLogin() {
  const loginGoogle = () => {
    window.location.href = `${SOCIAL_AUTH_BASE_URL}/auth/google`;
  };

  const loginKakao = () => {
    window.location.href = `${SOCIAL_AUTH_BASE_URL}/auth/kakao`;
  };

  return { loginGoogle, loginKakao };
}
