import '@testing-library/jest-dom';

import { server } from './mocks/server';

// MSW 핸들러와 Axios baseURL을 일치시키기 위한 테스트 환경 변수
process.env.NEXT_PUBLIC_API_URL = 'http://localhost';

vi.mock('*.svg', () => ({
  default: 'svg-mock',
}));

// Create the #__next element for react-modal tests
const root = document.createElement('div');
root.id = '__next';
document.body.appendChild(root);

// MSW 서버 라이프사이클
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
