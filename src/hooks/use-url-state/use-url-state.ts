import {useCallback} from 'react';
import {useSearchParams} from 'react-router';

type SetUrlStateOptions = {
  replace?: boolean;
};

type UrlState = readonly [string, (nextValue: string, options?: SetUrlStateOptions) => void];

/** Keeps a primitive filter value in the URL, including browser back/forward. */
export function useUrlState(key: string, defaultValue = ''): UrlState {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback((nextValue: string, options: SetUrlStateOptions = {}) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (nextValue && nextValue !== defaultValue) {
        nextParams.set(key, nextValue);
      } else {
        nextParams.delete(key);
      }
      return nextParams;
    }, options);
  }, [defaultValue, key, setSearchParams]);

  return [value, setValue];
}
