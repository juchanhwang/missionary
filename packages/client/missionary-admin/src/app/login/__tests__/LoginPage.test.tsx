import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useLogin } from '../_hooks/useLogin';
import LoginPage from '../page';

vi.mock('../hooks/useLogin', () => ({
  useLogin: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('LoginPage', () => {
  const mockMutate = vi.fn();
  const mockUseLogin = vi.mocked(useLogin);

  beforeEach(() => {
    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    delete (window as any).location;
    window.location = { search: '', href: '' } as any;
    window.history.replaceState = vi.fn();

    vi.clearAllMocks();
  });

  it('빈 폼을 제출하면 이메일과 비밀번호 에러 메시지를 표시한다', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument();
    });

    expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('유효한 이메일과 비밀번호를 제출하면 mutate를 호출한다', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('이메일');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        expect.any(Object),
      );
    });
  });

  it('isPending 상태일 때 버튼이 비활성화되고 "로그인 중..." 텍스트를 표시한다', () => {
    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: '로그인 중...' });

    expect(submitButton).toBeDisabled();
  });

  it('OAuth 에러 파라미터가 있으면 에러 메시지를 표시한다', () => {
    window.location = { search: '?error=oauth_failed', href: '' } as any;

    render(<LoginPage />);

    expect(
      screen.getByText('소셜 로그인에 실패했습니다. 다시 시도해주세요.'),
    ).toBeInTheDocument();
  });

  it('서버 에러 발생 시 에러 메시지를 표시한다', async () => {
    mockMutate.mockImplementation((variables, options) => {
      options?.onError?.();
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('이메일');
    const passwordInput = screen.getByPlaceholderText('비밀번호');
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.'),
      ).toBeInTheDocument();
    });
  });
});
