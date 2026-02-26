import { useSearchParams } from 'next/navigation';
import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { useLoginAction } from './_hooks/useLoginAction';
import LoginPage from './page';

vi.mock('./_hooks/useLoginAction', () => ({
  useLoginAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

describe('LoginPage', () => {
  const mockMutate = vi.fn();
  const mockUseLogin = vi.mocked(useLoginAction);
  const mockUseSearchParams = vi.mocked(useSearchParams);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useLoginAction>);

    mockUseSearchParams.mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>,
    );
  });

  it('빈 폼을 제출하면 이메일과 비밀번호 에러 메시지를 표시한다', async () => {
    const { user } = render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(
      await screen.findByText('이메일을 입력해주세요'),
    ).toBeInTheDocument();
    expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('유효한 이메일과 비밀번호를 제출하면 로그인 요청을 보낸다', async () => {
    const { user } = render(<LoginPage />);

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(mockMutate).toHaveBeenCalledWith(
      { email: 'test@example.com', password: 'password123' },
      expect.any(Object),
    );
  });

  it('로그인 요청 중에는 버튼이 비활성화되고 "로그인 중..." 텍스트를 표시한다', () => {
    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as unknown as ReturnType<typeof useLoginAction>);

    render(<LoginPage />);

    expect(screen.getByRole('button', { name: '로그인 중...' })).toBeDisabled();
  });

  it('OAuth 에러 파라미터가 있으면 에러 메시지를 표시한다', async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('error=oauth_failed') as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    render(<LoginPage />);

    expect(
      await screen.findByText('소셜 로그인에 실패했습니다. 다시 시도해주세요.'),
    ).toBeInTheDocument();
  });

  it('서버 에러 발생 시 에러 메시지를 표시한다', async () => {
    mockMutate.mockImplementation(
      (
        _variables: unknown,
        options?: { onError?: () => void; onSuccess?: () => void },
      ) => {
        options?.onError?.();
      },
    );

    const { user } = render(<LoginPage />);

    await user.type(screen.getByLabelText('이메일'), 'test@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(
      await screen.findByText('이메일 또는 비밀번호가 올바르지 않습니다.'),
    ).toBeInTheDocument();
  });
});
