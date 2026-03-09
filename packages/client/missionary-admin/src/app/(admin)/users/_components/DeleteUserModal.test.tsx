import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { DeleteUserModal } from './DeleteUserModal';

// vi.mock 없음 - 실제 useDeleteUserAction 훅이 MSW를 통해 동작

const API_URL = 'http://localhost';

describe('DeleteUserModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('삭제 확인 시 onSuccess 콜백을 호출한다', async () => {
    // Arrange: MSW 기본 핸들러가 DELETE /users/:id에 204 반환
    const { user } = render(
      <DeleteUserModal
        isOpen={true}
        userId="user-1"
        userName="홍길동"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // Act: 삭제 버튼 클릭
    // hidden: true — react-modal이 aria-hidden을 사용하기 때문에 필요
    await user.click(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    );

    // Assert: MSW가 204 반환 → onSuccess 호출
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('삭제 에러 시 에러 메시지를 표시한다', async () => {
    // Arrange: MSW 핸들러를 에러 응답으로 오버라이드 (message 없이 반환하여 기본 에러 메시지 사용)
    server.use(
      http.delete(`${API_URL}/users/:id`, () =>
        HttpResponse.json(null, { status: 500 }),
      ),
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

    // Act
    await user.click(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    );

    // Assert: 에러 메시지 표시 (findBy 사용 — 비동기 UI)
    expect(
      await screen.findByText('유저 삭제 중 오류가 발생했습니다.'),
    ).toBeInTheDocument();
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

    // hidden: true — react-modal이 aria-hidden을 사용하기 때문에 필요
    await user.click(
      screen.getByRole('button', { name: '취소', hidden: true }),
    );

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('삭제 버튼 클릭 후 mutation 진행 중에 버튼이 비활성화된다', async () => {
    // Arrange: MSW 핸들러를 지연 응답으로 오버라이드 (resolve되지 않는 Promise)
    server.use(
      http.delete(`${API_URL}/users/:id`, () => new Promise(() => {})),
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

    // Act: 삭제 버튼 클릭 → mutation 시작 → isPending = true
    await user.click(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    );

    // Assert: 버튼들이 비활성화됨
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: '삭제', hidden: true }),
      ).toBeDisabled();
    });
    expect(
      screen.getByRole('button', { name: '취소', hidden: true }),
    ).toBeDisabled();
  });
});
