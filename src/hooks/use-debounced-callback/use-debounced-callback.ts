import {useCallback, useEffect, useRef} from 'react';

/** Returns a stable callback that runs after the most recent delay. */
export function useDebouncedCallback<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delay: number) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => () => {
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current);
  }, []);

  return useCallback((...args: TArgs) => {
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => callbackRef.current(...args), delay);
  }, [delay]);
}
