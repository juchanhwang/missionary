import axios from 'axios';

// 프로덕션: Vercel Rewrites 프록시 (/api) 사용 (퍼스트파티 쿠키)
// 개발/테스트: 환경변수의 직접 URL 사용
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? '/api'
    : (process.env.NEXT_PUBLIC_API_URL ?? '/api');

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        return api(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
