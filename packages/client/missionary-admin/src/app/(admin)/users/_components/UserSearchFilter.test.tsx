import { render, screen, waitFor, within } from 'test/test-utils';
import { vi } from 'vitest';

import { UserSearchFilter } from './UserSearchFilter';

// design-system 컴포넌트 mock (외부 의존성 경계 모킹 — 허용)
vi.mock('@samilhero/design-system', () => ({
  SearchBox: ({
    value,
    placeholder,
    onChange,
  }: {
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    size?: string;
  }) => (
    <input
      role="searchbox"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
  Select: Object.assign(
    ({
      children,
    }: {
      children: React.ReactNode;
      onChange: (value?: string | string[] | null) => void;
      value?: string | null;
      size?: string;
    }) => <div data-testid="select">{children}</div>,
    {
      Trigger: ({ children }: { children: React.ReactNode }) => (
        <button type="button" data-testid="select-trigger">
          {children}
        </button>
      ),
      Options: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-options" hidden>
          {children}
        </div>
      ),
      Option: ({
        children,
        item,
      }: {
        children: React.ReactNode;
        item: string;
      }) => <div data-testid={`select-option-${item}`}>{children}</div>,
    },
  ),
}));

describe('UserSearchFilter', () => {
  const defaultProps = {
    search: '',
    role: '' as const,
    provider: '' as const,
    isBaptized: '',
    onSearchChange: vi.fn(),
    onRoleChange: vi.fn(),
    onProviderChange: vi.fn(),
    onBaptizedChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('검색어 입력 후 디바운싱을 거쳐 콜백을 호출한다', async () => {
    // 이 테스트는 real timers를 사용하여 실제 디바운스 동작을 검증한다
    vi.useRealTimers();

    const onSearchChange = vi.fn();

    const { user } = render(
      <UserSearchFilter {...defaultProps} onSearchChange={onSearchChange} />,
    );

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test');

    // 디바운싱(300ms) 후 콜백 호출 확인
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalled();
    });

    // 디바운싱으로 인해 마지막 값으로 호출
    const lastCall =
      onSearchChange.mock.calls[onSearchChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('test');
  });

  it('검색 placeholder를 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} />);

    expect(
      screen.getByPlaceholderText('이름 또는 이메일로 검색...'),
    ).toBeInTheDocument();
  });

  it('역할 필터 옵션을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[0]).getByText('전체 역할')).toBeInTheDocument();
  });

  it('인증방식 필터 옵션을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[1]).getByText('전체 인증방식')).toBeInTheDocument();
  });

  it('세례 여부 필터 옵션을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[2]).getByText('세례 여부')).toBeInTheDocument();
  });

  it('역할 필터가 선택되었을 때 선택된 값을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} role="ADMIN" />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[0]).getByText('관리자')).toBeInTheDocument();
  });

  it('인증방식 필터가 선택되었을 때 선택된 값을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} provider="GOOGLE" />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[1]).getByText('GOOGLE')).toBeInTheDocument();
  });

  it('세례 여부 필터가 선택되었을 때 선택된 값을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} isBaptized="true" />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[2]).getByText('받음')).toBeInTheDocument();
  });

  it('초기 검색어가 입력 필드에 표시된다', () => {
    render(<UserSearchFilter {...defaultProps} search="테스트" />);

    expect(screen.getByDisplayValue('테스트')).toBeInTheDocument();
  });
});
