import { http, HttpResponse } from 'msw';
import { useAuth } from 'lib/auth/AuthContext';
import { createMockUser } from 'test/mocks/data';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { UserForm } from './UserForm';

import type { User } from 'apis/user';

vi.mock('lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const API_URL = 'http://localhost';

describe('UserForm', () => {
  const mockOnDirtyChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'ADMIN',
        provider: 'LOCAL',
      },
      logout: vi.fn(),
    });
  });

  const renderForm = (overrides: Partial<User> = {}) => {
    const mockUser = createMockUser(overrides);
    return {
      ...render(<UserForm user={mockUser} onDirtyChange={mockOnDirtyChange} />),
      mockUser,
    };
  };

  it('기본 정보, 인증 정보, 교회 정보, 시스템 정보 섹션이 모두 표시된다', () => {
    renderForm();

    expect(screen.getByText('기본 정보')).toBeInTheDocument();
    expect(screen.getByText('인증 정보')).toBeInTheDocument();
    expect(screen.getByText('교회 정보')).toBeInTheDocument();
    expect(screen.getByText('시스템 정보')).toBeInTheDocument();
  });

  it('초기 상태에서 저장 버튼이 비활성화되어 있다', () => {
    renderForm();

    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('이름을 변경하면 변경사항 표시와 저장 버튼이 활성화된다', async () => {
    const { user } = renderForm();

    await user.clear(screen.getByLabelText('이름'));
    await user.type(screen.getByLabelText('이름'), '김철수');

    expect(screen.getByText('변경사항이 있습니다')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeEnabled();
  });

  it('폼 변경 시 onDirtyChange(true)가 호출된다', async () => {
    const { user } = renderForm();

    await user.clear(screen.getByLabelText('이름'));
    await user.type(screen.getByLabelText('이름'), '김철수');

    await waitFor(() => {
      expect(mockOnDirtyChange).toHaveBeenCalledWith(true);
    });
  });

  it('이름을 비우고 제출하면 유효성 검증 에러가 표시된다', async () => {
    const { user } = renderForm();

    await user.clear(screen.getByLabelText('이름'));
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(
      await screen.findByText('이름을 입력해주세요'),
    ).toBeInTheDocument();
  });

  it('저장 성공 시 변경사항 표시가 사라진다', async () => {
    const { user } = renderForm();

    await user.clear(screen.getByLabelText('이름'));
    await user.type(screen.getByLabelText('이름'), '김철수');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(
        screen.queryByText('변경사항이 있습니다'),
      ).not.toBeInTheDocument();
    });
  });

  it('저장 중 버튼 텍스트가 변경되고 비활성화된다', async () => {
    server.use(
      http.patch(`${API_URL}/users/:id`, () => new Promise(() => {})),
    );

    const { user } = renderForm();

    await user.clear(screen.getByLabelText('이름'));
    await user.type(screen.getByLabelText('이름'), '김철수');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: '저장 중...' }),
      ).toBeDisabled();
    });
  });

  it('저장 실패 시 변경사항이 유지된다', async () => {
    server.use(
      http.patch(`${API_URL}/users/:id`, () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    const { user } = renderForm();

    await user.clear(screen.getByLabelText('이름'));
    await user.type(screen.getByLabelText('이름'), '김철수');
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(screen.getByText('변경사항이 있습니다')).toBeInTheDocument();
    });
  });

  it('주민등록번호 보기/숨기기 토글이 동작한다', async () => {
    const { user } = renderForm({ identityNumber: '990101-1234567' });

    // 보기 버튼 클릭 → 숨기기로 변경
    await user.click(screen.getByRole('button', { name: /보기/ }));
    expect(screen.getByRole('button', { name: /숨기기/ })).toBeInTheDocument();

    // 숨기기 버튼 클릭 → 보기로 변경
    await user.click(screen.getByRole('button', { name: /숨기기/ }));
    expect(screen.getByRole('button', { name: /보기/ })).toBeInTheDocument();
  });

  it('ADMIN이 아닌 경우 편집 가능한 필드가 비활성화된다', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'staff-1',
        email: 'staff@test.com',
        role: 'STAFF',
        provider: 'LOCAL',
      },
      logout: vi.fn(),
    });

    renderForm();

    expect(screen.getByLabelText('이름')).toBeDisabled();
    expect(screen.getByLabelText('전화번호')).toBeDisabled();
  });

  it('ADMIN이 아닌 경우 주민등록번호 보기 버튼이 표시되지 않는다', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'staff-1',
        email: 'staff@test.com',
        role: 'STAFF',
        provider: 'LOCAL',
      },
      logout: vi.fn(),
    });

    renderForm({ identityNumber: '990101-1234567' });

    expect(
      screen.queryByRole('button', { name: /보기/ }),
    ).not.toBeInTheDocument();
  });
});
