import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userApi } from '../user';
import api from '../instance';

vi.mock('../instance', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create calls POST /users with user data', async () => {
    const data = { email: 'new@test.com', password: 'pass1234' };
    await userApi.create(data);
    expect(api.post).toHaveBeenCalledWith('/users', data);
  });
});
