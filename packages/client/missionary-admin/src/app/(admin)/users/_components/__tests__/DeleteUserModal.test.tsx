import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { useDeleteUser } from '../../_hooks/useDeleteUser';
import { DeleteUserModal } from '../DeleteUserModal';

vi.mock('../../_hooks/useDeleteUser', () => ({
  useDeleteUser: vi.fn(),
}));

describe('DeleteUserModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockMutate = vi.fn();
  const mockUseDeleteUser = vi.mocked(useDeleteUser);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDeleteUser.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteUser>);
  });

  it('모달이 열렸을 때 내용을 표시한다', () => {
    render(
      <DeleteUserModal
        isOpen={true}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText('유저 삭제')).toBeInTheDocument();
    expect(screen.getByText(/홍길동/)).toBeInTheDocument();
  });

  it('모달이 닫혔을 때 내용이 보이지 않는다', () => {
    render(
      <DeleteUserModal
        isOpen={false}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.queryByText('유저 삭제')).not.toBeInTheDocument();
  });

  it('"30일 후 영구 삭제" 문구가 존재한다', () => {
    render(
      <DeleteUserModal
        isOpen={true}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText('30일 후 영구 삭제됩니다.')).toBeInTheDocument();
  });

  it('삭제 확인 시 mutation을 호출한다', async () => {
    const { user } = render(
      <DeleteUserModal
        isOpen={true}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    );

    expect(mockMutate).toHaveBeenCalledWith('user-1', expect.any(Object));
  });

  it('삭제 성공 시 onSuccess 콜백을 호출한다', async () => {
    mockMutate.mockImplementation(
      (_id: string, options: { onSuccess: () => void }) => {
        options.onSuccess();
      },
    );

    const { user } = render(
      <DeleteUserModal
        isOpen={true}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    );

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('삭제 에러 시 에러 메시지를 표시한다', async () => {
    mockMutate.mockImplementation(
      (_id: string, options: { onError: (error: unknown) => void }) => {
        options.onError(new Error('삭제 실패'));
      },
    );

    const { user } = render(
      <DeleteUserModal
        isOpen={true}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('유저 삭제 중 오류가 발생했습니다.'),
      ).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭 시 onClose를 호출한다', async () => {
    const { user } = render(
      <DeleteUserModal
        isOpen={true}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '취소', hidden: true }),
    );

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('isPending 중에 버튼이 비활성화된다', () => {
    mockUseDeleteUser.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as unknown as ReturnType<typeof useDeleteUser>);

    render(
      <DeleteUserModal
        isOpen={true}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '취소', hidden: true }),
    ).toBeDisabled();
  });
});
