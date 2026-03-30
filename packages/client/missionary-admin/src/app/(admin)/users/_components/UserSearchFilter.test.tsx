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
    searchType: 'name' as const,
    keyword: '',
    role: '' as const,
    provider: '' as const,
    isBaptized: '',
    onSearchTypeChange: vi.fn(),
    onKeywordChange: vi.fn(),
    onClearKeyword: vi.fn(),
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
    vi.useRealTimers();

    const onKeywordChange = vi.fn();

    const { user } = render(
      <UserSearchFilter {...defaultProps} onKeywordChange={onKeywordChange} />,
    );

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test');

    await waitFor(() => {
      expect(onKeywordChange).toHaveBeenCalled();
    });

    const lastCall =
      onKeywordChange.mock.calls[onKeywordChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe('test');
  });

  it('검색 타입에 따라 placeholder를 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} searchType="name" />);

    expect(screen.getByPlaceholderText('이름으로 검색...')).toBeInTheDocument();
  });

  it('검색 타입을 아이디로 변경하면 placeholder가 변경된다', () => {
    render(<UserSearchFilter {...defaultProps} searchType="loginId" />);

    expect(screen.getByPlaceholderText('아이디로 검색...')).toBeInTheDocument();
  });

  it('검색 타입 선택 드롭다운의 기본값이 표시된다', () => {
    render(<UserSearchFilter {...defaultProps} />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[0]).getByText('이름')).toBeInTheDocument();
  });

  it('역할 필터 옵션을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[1]).getByText('전체 역할')).toBeInTheDocument();
  });

  it('인증방식 필터 옵션을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[2]).getByText('전체 인증방식')).toBeInTheDocument();
  });

  it('세례 여부 필터 옵션을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[3]).getByText('세례 여부')).toBeInTheDocument();
  });

  it('역할 필터가 선택되었을 때 선택된 값을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} role="ADMIN" />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[1]).getByText('관리자')).toBeInTheDocument();
  });

  it('인증방식 필터가 선택되었을 때 선택된 값을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} provider="GOOGLE" />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[2]).getByText('GOOGLE')).toBeInTheDocument();
  });

  it('세례 여부 필터가 선택되었을 때 선택된 값을 표시한다', () => {
    render(<UserSearchFilter {...defaultProps} isBaptized="true" />);

    const triggers = screen.getAllByRole('button');
    expect(within(triggers[3]).getByText('받음')).toBeInTheDocument();
  });

  it('초기 검색어가 입력 필드에 표시된다', () => {
    render(<UserSearchFilter {...defaultProps} keyword="테스트" />);

    expect(screen.getByDisplayValue('테스트')).toBeInTheDocument();
  });
});
