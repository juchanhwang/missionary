import { createMockUser, createMockUserList } from 'test/mocks/data';
import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { UserTable } from './UserTable';

describe('UserTable', () => {
  const mockOnRowClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('테이블 컬럼 헤더를 렌더링한다', () => {
    render(
      <UserTable users={[]} isLoading={false} onRowClick={mockOnRowClick} />,
    );

    // 빈 상태이므로 테이블 헤더는 표시되지 않음
    expect(screen.getByText('조건에 맞는 유저가 없습니다')).toBeInTheDocument();
  });

  it('유저 목록이 있을 때 테이블 헤더를 표시한다', () => {
    const users = createMockUserList(2);

    render(
      <UserTable users={users} isLoading={false} onRowClick={mockOnRowClick} />,
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
      <UserTable users={users} isLoading={false} onRowClick={mockOnRowClick} />,
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

  it('행 클릭 시 onRowClick 콜백을 호출한다', async () => {
    const users = [createMockUser({ id: 'user-abc', name: '테스트유저' })];

    const { user } = render(
      <UserTable users={users} isLoading={false} onRowClick={mockOnRowClick} />,
    );

    await user.click(screen.getByRole('cell', { name: '테스트유저' }));

    expect(mockOnRowClick).toHaveBeenCalledWith('user-abc');
  });

  it('빈 상태를 표시한다', () => {
    render(
      <UserTable users={[]} isLoading={false} onRowClick={mockOnRowClick} />,
    );

    expect(screen.getByText('조건에 맞는 유저가 없습니다')).toBeInTheDocument();
  });

  it('로딩 중일 때 로딩 메시지를 표시한다', () => {
    render(
      <UserTable users={[]} isLoading={true} onRowClick={mockOnRowClick} />,
    );

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('유저의 역할 배지를 표시한다', () => {
    const users = [createMockUser({ role: 'ADMIN', name: '관리자' })];

    render(
      <UserTable users={users} isLoading={false} onRowClick={mockOnRowClick} />,
    );

    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('유저의 인증방식 배지를 표시한다', () => {
    const users = [createMockUser({ provider: 'GOOGLE', name: '구글유저' })];

    render(
      <UserTable users={users} isLoading={false} onRowClick={mockOnRowClick} />,
    );

    expect(screen.getByText('GOOGLE')).toBeInTheDocument();
  });

  it('유저의 로그인ID를 표시한다', () => {
    const users = [
      createMockUser({ loginId: 'testlogin', name: '로그인유저' }),
    ];

    render(
      <UserTable users={users} isLoading={false} onRowClick={mockOnRowClick} />,
    );

    expect(screen.getByText('testlogin')).toBeInTheDocument();
  });
});
