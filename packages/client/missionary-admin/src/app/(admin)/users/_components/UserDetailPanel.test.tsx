import { createMockUser } from 'test/mocks/data';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { UserDetailPanel } from './UserDetailPanel';

// vi.mock 없음 - 실제 useGetUser, useUpdateUserAction 훅이 MSW를 통해 동작

const API_URL = 'http://localhost';

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

  beforeEach(() => {
    vi.clearAllMocks();

    // 기본 MSW 핸들러를 오버라이드하여 특정 유저 데이터 반환
    server.use(
      http.get(`${API_URL}/users/:id`, () =>
        HttpResponse.json(mockUser),
      ),
    );
  });

  it('userId가 있을 때 패널을 렌더링한다', async () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    // MSW에서 데이터를 가져올 때까지 대기 (findBy 사용)
    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('hong@example.com')).toBeInTheDocument();
  });

  it('읽기 전용 필드(이메일, 인증방식, 로그인ID)를 확인한다', async () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    // MSW 데이터 로드 대기
    await screen.findByDisplayValue('hong@example.com');

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

    // MSW 데이터 로드 대기
    const nameInput = await screen.findByDisplayValue('홍길동');

    // 초기에는 되돌리기 버튼이 없음
    expect(screen.queryByText('되돌리기')).not.toBeInTheDocument();

    // 이름 필드 수정
    await user.clear(nameInput);
    await user.type(nameInput, '김철수');

    // 변경 후 되돌리기 버튼과 변경사항 메시지 표시
    expect(await screen.findByText('되돌리기')).toBeInTheDocument();
    expect(screen.getByText('변경사항이 있습니다')).toBeInTheDocument();
  });

  it('STAFF 읽기 전용 모드에서 모든 입력 필드가 disabled 상태이다', async () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="STAFF"
      />,
    );

    // MSW 데이터 로드 대기
    const nameInput = await screen.findByDisplayValue('홍길동');

    // 편집 가능한 필드들이 disabled
    expect(nameInput).toBeDisabled();

    const phoneInput = screen.getByDisplayValue('010-1234-5678');
    expect(phoneInput).toBeDisabled();
  });

  it('STAFF 모드에서 삭제 버튼이 표시되지 않는다', async () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="STAFF"
      />,
    );

    // MSW 데이터 로드 대기
    await screen.findByText('홍길동');

    expect(screen.queryByTitle('유저 삭제')).not.toBeInTheDocument();
  });

  it('ADMIN 모드에서 삭제 버튼이 표시된다', async () => {
    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    // MSW 데이터 로드 대기
    await screen.findByText('홍길동');

    expect(screen.getByTitle('유저 삭제')).toBeInTheDocument();
  });

  it('폼 제출 시 updateUser mutation을 호출한다', async () => {
    // Arrange: PATCH 핸들러를 오버라이드하여 호출 검증
    let patchCalled = false;
    let patchBody: Record<string, unknown> = {};

    server.use(
      http.patch(`${API_URL}/users/:id`, async ({ request, params }) => {
        patchCalled = true;
        patchBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          createMockUser({ id: params.id as string, name: '김철수' }),
        );
      }),
    );

    const { user } = render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
        onDeleteRequest={mockOnDeleteRequest}
      />,
    );

    // MSW 데이터 로드 대기
    const nameInput = await screen.findByDisplayValue('홍길동');

    // 이름 변경하여 dirty 상태로 만들기
    await user.clear(nameInput);
    await user.type(nameInput, '김철수');

    // 저장 버튼이 활성화될 때까지 대기
    const saveButton = await screen.findByText('저장');
    expect(saveButton).not.toBeDisabled();

    // 저장 버튼 클릭
    await user.click(saveButton);

    // PATCH 요청이 전송되었는지 확인
    await waitFor(() => {
      expect(patchCalled).toBe(true);
    });
    expect(patchBody).toEqual(
      expect.objectContaining({ name: '김철수' }),
    );
  });

  it('로딩 중일 때 로딩 메시지를 표시한다', () => {
    // Arrange: MSW 핸들러를 지연 응답으로 오버라이드 (resolve되지 않는 Promise)
    server.use(
      http.get(`${API_URL}/users/:id`, () => new Promise(() => {})),
    );

    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
      />,
    );

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('유저를 찾을 수 없을 때 안내 메시지를 표시한다', async () => {
    // Arrange: MSW 핸들러를 404 응답으로 오버라이드
    server.use(
      http.get(`${API_URL}/users/:id`, () =>
        HttpResponse.json(null, { status: 404 }),
      ),
    );

    render(
      <UserDetailPanel
        userId="user-1"
        onClose={mockOnClose}
        currentUserRole="ADMIN"
      />,
    );

    expect(
      await screen.findByText('유저 정보를 찾을 수 없습니다'),
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

    // MSW 데이터 로드 대기
    await screen.findByText('홍길동');

    await user.click(screen.getByTitle('유저 삭제'));

    expect(mockOnDeleteRequest).toHaveBeenCalledWith('user-1', '홍길동');
  });
});
