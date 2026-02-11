const SOCIAL_AUTH_BASE_URL = process.env.NEXT_PUBLIC_PROXY_API_URL;

export function useSocialLogin() {
  const loginGoogle = () => {
    window.location.href = `${SOCIAL_AUTH_BASE_URL}/auth/google`;
  };

  const loginKakao = () => {
    window.location.href = `${SOCIAL_AUTH_BASE_URL}/auth/kakao`;
  };

  return { loginGoogle, loginKakao };
}
