import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delay 후 콜백을 실행한다', () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current[0]('hello');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith('hello');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('연속 호출 시 마지막 호출만 실행된다', () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current[0]('a');
      result.current[0]('b');
      result.current[0]('c');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });

  it('cancel로 대기 중인 콜백을 취소한다', () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current[0]('hello');
    });

    act(() => {
      result.current[1]();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('언마운트 시 타이머를 정리한다', () => {
    const callback = vi.fn();

    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 300),
    );

    act(() => {
      result.current[0]('hello');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('여러 인자를 전달할 수 있다', () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(callback, 200));

    act(() => {
      result.current[0]('a', 1, true);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledWith('a', 1, true);
  });

  it('cancel 후 다시 호출하면 정상 작동한다', () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current[0]('first');
    });

    act(() => {
      result.current[1]();
    });

    act(() => {
      result.current[0]('second');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('리렌더 후에도 최신 콜백을 사용한다', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    let currentCallback = callback1;

    const { result, rerender } = renderHook(() =>
      useDebouncedCallback(currentCallback, 300),
    );

    act(() => {
      result.current[0]('hello');
    });

    currentCallback = callback2;
    rerender();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith('hello');
  });
});
