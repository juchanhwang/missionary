import { createMockUser } from 'test/mocks/data';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { useGetUser } from '../../_hooks/useGetUser';
import { useUpdateUser } from '../../_hooks/useUpdateUser';
import { UserDetailPanel } from '../UserDetailPanel';

vi.mock('../../_hooks/useGetUser', () => ({
  useGetUser: vi.fn(),
}));

vi.mock('../../_hooks/useUpdateUser', () => ({
  useUpdateUser: vi.fn(),
}));

const mockUser = createMockUser({
  id: 'user-1',
  name: '홍길동',
  email: 'hong@example.com',
  provider: 'LOCAL',
  loginId: 'hong123',
  phoneNumber: '010-1234-5678',
  role: 'USER',
  gender: 'MALE',
  birthDate: '1999-01-01T00:00:00.000Z',
  isBaptized: true,
  baptizedAt: '2020-06-15T00:00:00.000Z',
  identityNumber: '990101-1234567',
});

describe('UserDetailPanel', () => {
  const mockOnClose = vi.fn();
  const mockOnDeleteRequest = vi.fn();
  const mockMutate = vi.fn();
  const mockUseGetUser = vi.mocked(useGetUser);
  const mockUseUpdateUser = vi.mocked(useUpdateUser);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGetUser.mockReturnValue({
      data: mockUser,
      isLoading: false,
    } as unknown as ReturnType<typeof useGetUser>);

    mockUseUpdateUser.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateUser>);
  });

  it('userId가 있을 때 패널을 렌더링한다', () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('hong@example.com')).toBeInTheDocument();
  });

  it('읽기 전용 필드(이메일, 인증방식, 로그인ID)를 확인한다', () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    const emailInput = screen.getByDisplayValue('hong@example.com');
    expect(emailInput).toHaveAttribute('readOnly');

    const providerInput = screen.getByDisplayValue('LOCAL');
    expect(providerInput).toHaveAttribute('readOnly');

    const loginIdInput = screen.getByDisplayValue('hong123');
    expect(loginIdInput).toHaveAttribute('readOnly');
  });

  it('값 변경 시 저장/되돌리기 버튼이 활성화된다 (Dirty check)', async () => {
    const { user } = render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    // 초기에는 되돌리기 버튼이 없음
    expect(screen.queryByText('되돌리기')).not.toBeInTheDocument();

    // 이름 필드 수정
    const nameInput = screen.getByDisplayValue('홍길동');
    await user.clear(nameInput);
    await user.type(nameInput, '김철수');

    // 변경 후 되돌리기 버튼과 변경사항 메시지 표시
    await waitFor(() => {
      expect(screen.getByText('되돌리기')).toBeInTheDocument();
    });
    expect(screen.getByText('변경사항이 있습니다')).toBeInTheDocument();
  });

  it('STAFF 읽기 전용 모드에서 모든 입력 필드가 disabled 상태이다', () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="STAFF"
      />,
    );

    // 편집 가능한 필드들이 disabled
    const nameInput = screen.getByDisplayValue('홍길동');
    expect(nameInput).toBeDisabled();

    const phoneInput = screen.getByDisplayValue('010-1234-5678');
    expect(phoneInput).toBeDisabled();
  });

  it('STAFF 모드에서 삭제 버튼이 표시되지 않는다', () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="STAFF"
      />,
    );

    expect(screen.queryByTitle('유저 삭제')).not.toBeInTheDocument();
  });

  it('ADMIN 모드에서 삭제 버튼이 표시된다', () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    expect(screen.getByTitle('유저 삭제')).toBeInTheDocument();
  });

  it('폼 제출 시 updateUser mutation을 호출한다', async () => {
    const { user } = render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    // 이름 변경하여 dirty 상태로 만들기
    const nameInput = screen.getByDisplayValue('홍길동');
    await user.clear(nameInput);
    await user.type(nameInput, '김철수');

    // 저장 버튼 클릭
    await waitFor(() => {
      expect(screen.getByText('저장')).not.toBeDisabled();
    });
    await user.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '김철수',
        }),
        expect.any(Object),
      );
    });
  });

  it('로딩 중일 때 로딩 메시지를 표시한다', () => {
    mockUseGetUser.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useGetUser>);

    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
      />,
    );

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('유저를 찾을 수 없을 때 안내 메시지를 표시한다', () => {
    mockUseGetUser.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useGetUser>);

    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
      />,
    );

    expect(
      screen.getByText('유저 정보를 찾을 수 없습니다'),
    ).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 onDeleteRequest 콜백을 호출한다', async () => {
    const { user } = render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    await user.click(screen.getByTitle('유저 삭제'));

    expect(mockOnDeleteRequest).toHaveBeenCalledWith('user-1', '홍길동');
  });
});
