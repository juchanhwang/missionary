import { renderHook, act } from '@testing-library/react';

import { useTeamFilter } from './useTeamFilter';

const PATHNAME = '/enrollment/missionary-1/teams';

const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  usePathname: () => PATHNAME,
  useSearchParams: () => mockSearchParams,
}));

describe('useTeamFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debouncedQuery 변경 시 router.replace가 ?q= param과 함께 호출된다', () => {
    const { result } = renderHook(() => useTeamFilter());

    act(() => {
      result.current.setFilter({ query: '검색어', regionId: '' });
    });

    // 디바운스 전에는 호출되지 않음
    expect(mockReplace).not.toHaveBeenCalled();

    // 200ms 디바운스 경과
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      `${PATHNAME}?q=%EA%B2%80%EC%83%89%EC%96%B4`,
      { scroll: false },
    );
  });

  it('초기 URL searchParams에서 localQuery와 regionId를 복원한다', () => {
    mockSearchParams = new URLSearchParams('q=초기값&region=region-1');

    const { result } = renderHook(() => useTeamFilter());

    expect(result.current.filter.query).toBe('초기값');
    expect(result.current.filter.regionId).toBe('region-1');
  });

  it('resetFilter() 호출 시 q와 region이 URL에서 제거된다', () => {
    mockSearchParams = new URLSearchParams('q=test&region=r1');

    const { result } = renderHook(() => useTeamFilter());

    act(() => {
      result.current.resetFilter();
    });

    expect(mockReplace).toHaveBeenCalledWith(PATHNAME, { scroll: false });
    expect(result.current.filter.query).toBe('');
  });

  it('router.push가 아닌 router.replace를 사용한다', () => {
    const { result } = renderHook(() => useTeamFilter());

    act(() => {
      result.current.setFilter({ query: '', regionId: 'region-1' });
    });

    expect(mockReplace).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('regionId 변경은 디바운스 없이 즉시 URL에 반영된다', () => {
    const { result } = renderHook(() => useTeamFilter());

    act(() => {
      result.current.setFilter({ query: '', regionId: 'region-1' });
    });

    // 디바운스 대기 없이 즉시 호출
    expect(mockReplace).toHaveBeenCalledWith(`${PATHNAME}?region=region-1`, {
      scroll: false,
    });
  });

  it('빈 query는 URL에서 q param을 생략한다', () => {
    mockSearchParams = new URLSearchParams('q=이전값');

    const { result } = renderHook(() => useTeamFilter());

    act(() => {
      result.current.setFilter({ query: '', regionId: '' });
    });

    // localQuery가 빈 문자열로 변경 → 디바운스 경과 후 q 제거
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockReplace).toHaveBeenCalledWith(PATHNAME, { scroll: false });
  });
});
