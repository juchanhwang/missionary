import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { GroupPanel } from './GroupPanel';
import { useGetMissionGroups } from '../_hooks/useGetMissionGroups';

vi.mock('../_hooks/useGetMissionGroups', () => ({
  useGetMissionGroups: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({})),
  usePathname: vi.fn(() => '/missions'),
}));

vi.mock('next/link', () => ({
  default: (props: React.ComponentPropsWithRef<'a'>) => <a {...props} />,
}));

const mockGroups = [
  {
    id: '1',
    name: '필리핀 선교',
    category: 'ABROAD',
    createdAt: '2024-01-01',
    _count: { missionaries: 3 },
  },
  {
    id: '2',
    name: '제주도 선교',
    category: 'DOMESTIC',
    createdAt: '2024-01-02',
    _count: { missionaries: 1 },
  },
  {
    id: '3',
    name: '태국 선교',
    category: 'ABROAD',
    createdAt: '2024-01-03',
    _count: { missionaries: 0 },
  },
];

describe('GroupPanel', () => {
  const mockUseGetMissionGroups = vi.mocked(useGetMissionGroups);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetMissionGroups.mockReturnValue({
      data: mockGroups,
      isLoading: false,
    } as unknown as ReturnType<typeof useGetMissionGroups>);
  });

  it('그룹 목록을 렌더링한다', () => {
    render(<GroupPanel />);

    expect(screen.getByText('필리핀 선교')).toBeInTheDocument();
    expect(screen.getByText('제주도 선교')).toBeInTheDocument();
    expect(screen.getByText('태국 선교')).toBeInTheDocument();
  });

  it('로딩 중일 때 로딩 메시지를 표시한다', () => {
    mockUseGetMissionGroups.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useGetMissionGroups>);

    render(<GroupPanel />);

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('그룹이 없을 때 빈 상태 메시지를 표시한다', () => {
    mockUseGetMissionGroups.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useGetMissionGroups>);

    render(<GroupPanel />);

    expect(screen.getByText('등록된 그룹이 없습니다')).toBeInTheDocument();
  });

  it('검색어를 입력하면 일치하는 그룹만 표시한다', async () => {
    const { user } = render(<GroupPanel />);

    await user.type(screen.getByLabelText('그룹 검색'), '필리핀');

    expect(screen.getByText('필리핀 선교')).toBeInTheDocument();
    expect(screen.queryByText('제주도 선교')).not.toBeInTheDocument();
    expect(screen.queryByText('태국 선교')).not.toBeInTheDocument();
  });

  it('검색 결과가 없을 때 안내 메시지를 표시한다', async () => {
    const { user } = render(<GroupPanel />);

    await user.type(screen.getByLabelText('그룹 검색'), '존재하지않는그룹');

    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('"국내" 필터를 선택하면 국내 그룹만 표시한다', async () => {
    const { user } = render(<GroupPanel />);

    await user.click(screen.getByRole('tab', { name: '국내' }));

    expect(screen.getByText('제주도 선교')).toBeInTheDocument();
    expect(screen.queryByText('필리핀 선교')).not.toBeInTheDocument();
    expect(screen.queryByText('태국 선교')).not.toBeInTheDocument();
  });

  it('"해외" 필터를 선택하면 해외 그룹만 표시한다', async () => {
    const { user } = render(<GroupPanel />);

    await user.click(screen.getByRole('tab', { name: '해외' }));

    expect(screen.getByText('필리핀 선교')).toBeInTheDocument();
    expect(screen.getByText('태국 선교')).toBeInTheDocument();
    expect(screen.queryByText('제주도 선교')).not.toBeInTheDocument();
  });

  it('선교 차수가 있는 그룹은 차수 배지를 표시한다', () => {
    render(<GroupPanel />);

    expect(screen.getByText('3차')).toBeInTheDocument();
    expect(screen.getByText('1차')).toBeInTheDocument();
  });

  it('"새 그룹 만들기" 링크가 올바른 경로를 가진다', () => {
    render(<GroupPanel />);

    expect(
      screen.getByRole('link', { name: '새 그룹 만들기' }),
    ).toHaveAttribute('href', '/missions/create');
  });
});
