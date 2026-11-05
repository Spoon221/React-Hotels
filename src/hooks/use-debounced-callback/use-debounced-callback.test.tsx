import {act, renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {useDebouncedCallback} from './use-debounced-callback';

describe('useDebouncedCallback', () => {
  it('only invokes the latest scheduled callback', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const {result, unmount} = renderHook(() => useDebouncedCallback(callback, 200));

    act(() => {
      result.current('first');
      result.current('second');
      vi.advanceTimersByTime(200);
    });
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('second');
    unmount();
    vi.useRealTimers();
  });
});
