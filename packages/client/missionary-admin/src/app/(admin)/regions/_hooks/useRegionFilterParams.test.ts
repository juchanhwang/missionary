import { act } from '@testing-library/react';
import { renderHook } from 'test/test-utils';
import { vi } from 'vitest';

import { useRegionFilterParams } from './useRegionFilterParams';

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

describe('useRegionFilterParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('URL에서 파라미터를 파싱한다', () => {
    mockSearchParams = new URLSearchParams(
      'query=서울&missionGroupId=g1&missionaryId=m1&page=3',
    );

    const { result } = renderHook(() => useRegionFilterParams());

    expect(result.current.params).toEqual({
      query: '서울',
      missionGroupId: 'g1',
      missionaryId: 'm1',
      page: 3,
    });
  });

  it('파라미터가 없으면 기본값을 반환한다', () => {
    const { result } = renderHook(() => useRegionFilterParams());

    expect(result.current.params).toEqual({
      query: '',
      missionGroupId: '',
      missionaryId: '',
      page: 1,
    });
  });

  it('음수 페이지는 1로 보정한다', () => {
    mockSearchParams = new URLSearchParams('page=-5');

    const { result } = renderHook(() => useRegionFilterParams());

    expect(result.current.params.page).toBe(1);
  });

  it('0 페이지는 1로 보정한다', () => {
    mockSearchParams = new URLSearchParams('page=0');

    const { result } = renderHook(() => useRegionFilterParams());

    expect(result.current.params.page).toBe(1);
  });

  it('missionGroupId 변경 시 missionaryId와 page가 리셋된다', () => {
    mockSearchParams = new URLSearchParams(
      'missionGroupId=g1&missionaryId=m1&page=3',
    );

    const { result } = renderHook(() => useRegionFilterParams());

    act(() => {
      result.current.setMissionGroupId('g2');
    });

    expect(mockReplace).toHaveBeenCalledWith('?missionGroupId=g2', {
      scroll: false,
    });
  });

  it('missionGroupId를 빈 문자열로 설정하면 관련 파라미터가 모두 삭제된다', () => {
    mockSearchParams = new URLSearchParams('missionGroupId=g1');

    const { result } = renderHook(() => useRegionFilterParams());

    act(() => {
      result.current.setMissionGroupId('');
    });

    expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
  });

  it('setQuery는 300ms 디바운스 후 URL을 업데이트한다', () => {
    const { result } = renderHook(() => useRegionFilterParams());

    act(() => {
      result.current.setQuery('검색어');
    });

    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      '?query=%EA%B2%80%EC%83%89%EC%96%B4',
      {
        scroll: false,
      },
    );
  });

  it('clearQuery는 디바운스를 취소하고 즉시 query를 삭제한다', () => {
    const { result } = renderHook(() => useRegionFilterParams());

    act(() => {
      result.current.setQuery('대기중');
    });

    act(() => {
      result.current.clearQuery();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // clearQuery의 즉시 호출만 실행되고, setQuery의 디바운스는 취소됨
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
  });
});
