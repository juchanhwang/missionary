import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../auth';
import api from '../instance';

vi.mock('../instance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login calls POST /auth/login with email and password', async () => {
    await authApi.login('test@test.com', 'password123');
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('logout calls POST /auth/logout', async () => {
    await authApi.logout();
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('getMe calls GET /auth/me', async () => {
    await authApi.getMe();
    expect(api.get).toHaveBeenCalledWith('/auth/me');
  });

  it('refresh calls POST /auth/refresh', async () => {
    await authApi.refresh();
    expect(api.post).toHaveBeenCalledWith('/auth/refresh');
  });

  it('changePassword calls PATCH /auth/change-password', async () => {
    await authApi.changePassword('oldPass', 'newPass');
    expect(api.patch).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'oldPass',
      newPassword: 'newPass',
    });
  });
});
