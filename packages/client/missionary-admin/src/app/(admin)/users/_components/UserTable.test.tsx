import { createMockUser, createMockUserList } from 'test/mocks/data';
import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { UserTable } from './UserTable';

describe('UserTable', () => {
  const mockOnSelectUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('테이블 컬럼 헤더를 렌더링한다', () => {
    render(
      <UserTable
        users={[]}
        isLoading={false}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    // 빈 상태이므로 테이블 헤더는 표시되지 않음
    expect(screen.getByText('조건에 맞는 유저가 없습니다')).toBeInTheDocument();
  });

  it('유저 목록이 있을 때 테이블 헤더를 표시한다', () => {
    const users = createMockUserList(2);

    render(
      <UserTable
        users={users}
        isLoading={false}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    expect(
      screen.getByRole('columnheader', { name: '이름' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '이메일' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '역할' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '인증방식' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '로그인ID' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '전화번호' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '생년월일' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '성별' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '세례' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '주민번호' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: '가입일' }),
    ).toBeInTheDocument();
  });

  it('유저 데이터 행을 표시한다', () => {
    const users = createMockUserList(3);

    render(
      <UserTable
        users={users}
        isLoading={false}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    expect(screen.getByRole('cell', { name: '사용자1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '사용자2' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '사용자3' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'user1@example.com' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'user2@example.com' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'user3@example.com' }),
    ).toBeInTheDocument();
  });

  it('행 클릭 시 onSelectUser 콜백을 호출한다', async () => {
    const users = [createMockUser({ id: 'user-abc', name: '테스트유저' })];

    const { user } = render(
      <UserTable
        users={users}
        isLoading={false}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    await user.click(screen.getByRole('cell', { name: '테스트유저' }));

    expect(mockOnSelectUser).toHaveBeenCalledWith('user-abc');
  });

  it('선택된 행에 aria-selected가 적용된다', () => {
    const users = [
      createMockUser({ id: 'user-1', name: '유저A' }),
      createMockUser({ id: 'user-2', name: '유저B' }),
    ];

    render(
      <UserTable
        users={users}
        isLoading={false}
        selectedUserId="user-1"
        onSelectUser={mockOnSelectUser}
      />,
    );

    const rows = screen.getAllByRole('row');
    // rows[0]은 헤더 행, rows[1]은 유저A 행, rows[2]는 유저B 행
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('빈 상태를 표시한다', () => {
    render(
      <UserTable
        users={[]}
        isLoading={false}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    expect(screen.getByText('조건에 맞는 유저가 없습니다')).toBeInTheDocument();
  });

  it('로딩 중일 때 로딩 메시지를 표시한다', () => {
    render(
      <UserTable
        users={[]}
        isLoading={true}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('유저의 역할 배지를 표시한다', () => {
    const users = [createMockUser({ role: 'ADMIN', name: '관리자' })];

    render(
      <UserTable
        users={users}
        isLoading={false}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('유저의 인증방식 배지를 표시한다', () => {
    const users = [createMockUser({ provider: 'GOOGLE', name: '구글유저' })];

    render(
      <UserTable
        users={users}
        isLoading={false}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    expect(screen.getByText('GOOGLE')).toBeInTheDocument();
  });

  it('유저의 로그인ID를 표시한다', () => {
    const users = [
      createMockUser({ loginId: 'testlogin', name: '로그인유저' }),
    ];

    render(
      <UserTable
        users={users}
        isLoading={false}
        selectedUserId={null}
        onSelectUser={mockOnSelectUser}
      />,
    );

    expect(screen.getByText('testlogin')).toBeInTheDocument();
  });
});
