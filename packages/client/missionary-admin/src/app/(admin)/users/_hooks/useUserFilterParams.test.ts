import { act } from '@testing-library/react';
import { renderHook } from 'test/test-utils';
import { vi } from 'vitest';

import { useUserFilterParams } from './useUserFilterParams';

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

describe('useUserFilterParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('URL 파싱', () => {
    it('URL에서 파라미터를 파싱한다', () => {
      mockSearchParams = new URLSearchParams(
        'searchType=loginId&keyword=test&role=ADMIN&provider=GOOGLE&isBaptized=true&page=2',
      );

      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.params).toEqual({
        searchType: 'loginId',
        keyword: 'test',
        role: 'ADMIN',
        provider: 'GOOGLE',
        isBaptized: 'true',
        page: 2,
      });
    });

    it('파라미터가 없으면 기본값을 반환한다', () => {
      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.params).toEqual({
        searchType: 'name',
        keyword: '',
        role: '',
        provider: '',
        isBaptized: '',
        page: 1,
      });
    });

    it('잘못된 searchType은 name으로 보정한다', () => {
      mockSearchParams = new URLSearchParams('searchType=invalid');

      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.params.searchType).toBe('name');
    });

    it('잘못된 role은 빈 문자열로 보정한다', () => {
      mockSearchParams = new URLSearchParams('role=INVALID');

      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.params.role).toBe('');
    });

    it('잘못된 provider는 빈 문자열로 보정한다', () => {
      mockSearchParams = new URLSearchParams('provider=INVALID');

      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.params.provider).toBe('');
    });

    it('잘못된 isBaptized는 빈 문자열로 보정한다', () => {
      mockSearchParams = new URLSearchParams('isBaptized=maybe');

      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.params.isBaptized).toBe('');
    });

    it('음수 페이지는 1로 보정한다', () => {
      mockSearchParams = new URLSearchParams('page=-5');

      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.params.page).toBe(1);
    });

    it('0 페이지는 1로 보정한다', () => {
      mockSearchParams = new URLSearchParams('page=0');

      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.params.page).toBe(1);
    });
  });

  describe('setSearchType', () => {
    it('searchType 변경 시 keyword와 page가 리셋된다', () => {
      mockSearchParams = new URLSearchParams(
        'searchType=name&keyword=test&page=3',
      );

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setSearchType('loginId');
      });

      expect(mockReplace).toHaveBeenCalledWith('?searchType=loginId', {
        scroll: false,
      });
    });

    it('name(기본값)으로 변경하면 URL에서 searchType이 제거된다', () => {
      mockSearchParams = new URLSearchParams('searchType=loginId');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setSearchType('name');
      });

      expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
    });

    it('대기 중인 keyword 디바운스를 취소한다', () => {
      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setKeyword('검색어');
      });

      act(() => {
        result.current.setSearchType('phone');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // setSearchType 호출만 실행되고, setKeyword의 디바운스는 취소됨
      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('?searchType=phone', {
        scroll: false,
      });
    });
  });

  describe('setKeyword', () => {
    it('300ms 디바운스 후 URL을 업데이트한다', () => {
      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setKeyword('검색어');
      });

      expect(mockReplace).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('keyword='),
        { scroll: false },
      );
    });

    it('keyword 변경 시 page가 리셋된다', () => {
      mockSearchParams = new URLSearchParams('page=3');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setKeyword('test');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const calledUrl = mockReplace.mock.calls[0][0] as string;
      expect(calledUrl).toContain('keyword=test');
      expect(calledUrl).not.toContain('page=');
    });
  });

  describe('clearKeyword', () => {
    it('디바운스를 취소하고 즉시 keyword를 삭제한다', () => {
      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setKeyword('대기중');
      });

      act(() => {
        result.current.clearKeyword();
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
    });
  });

  describe('setRole', () => {
    it('role 변경 시 page가 리셋된다', () => {
      mockSearchParams = new URLSearchParams('role=USER&page=3');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setRole('ADMIN');
      });

      expect(mockReplace).toHaveBeenCalledWith('?role=ADMIN', {
        scroll: false,
      });
    });

    it('빈 문자열로 설정하면 URL에서 제거된다', () => {
      mockSearchParams = new URLSearchParams('role=USER');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setRole('');
      });

      expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
    });
  });

  describe('setProvider', () => {
    it('provider 변경 시 page가 리셋된다', () => {
      mockSearchParams = new URLSearchParams('provider=LOCAL&page=3');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setProvider('GOOGLE');
      });

      expect(mockReplace).toHaveBeenCalledWith('?provider=GOOGLE', {
        scroll: false,
      });
    });

    it('빈 문자열로 설정하면 URL에서 제거된다', () => {
      mockSearchParams = new URLSearchParams('provider=LOCAL');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setProvider('');
      });

      expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
    });
  });

  describe('setIsBaptized', () => {
    it('isBaptized 변경 시 page가 리셋된다', () => {
      mockSearchParams = new URLSearchParams('isBaptized=true&page=3');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setIsBaptized('false');
      });

      expect(mockReplace).toHaveBeenCalledWith('?isBaptized=false', {
        scroll: false,
      });
    });

    it('빈 문자열로 설정하면 URL에서 제거된다', () => {
      mockSearchParams = new URLSearchParams('isBaptized=true');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setIsBaptized('');
      });

      expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
    });
  });

  describe('setPage', () => {
    it('페이지를 변경한다', () => {
      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setPage(3);
      });

      expect(mockReplace).toHaveBeenCalledWith('?page=3', { scroll: false });
    });

    it('1페이지는 URL에서 page를 제거한다', () => {
      mockSearchParams = new URLSearchParams('page=3');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setPage(1);
      });

      expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
    });
  });

  describe('queryParams', () => {
    it('pageSize가 포함된다', () => {
      const { result } = renderHook(() => useUserFilterParams());

      expect(result.current.queryParams).toEqual({
        searchType: 'name',
        keyword: '',
        role: '',
        provider: '',
        isBaptized: '',
        page: 1,
        pageSize: 20,
      });
    });
  });

  describe('URL 파라미터 보존', () => {
    it('관리하지 않는 URL 파라미터를 유지한다', () => {
      mockSearchParams = new URLSearchParams('userId=u1&role=USER');

      const { result } = renderHook(() => useUserFilterParams());

      act(() => {
        result.current.setProvider('GOOGLE');
      });

      const calledUrl = mockReplace.mock.calls[0][0] as string;
      expect(calledUrl).toContain('userId=u1');
      expect(calledUrl).toContain('provider=GOOGLE');
    });
  });
});
