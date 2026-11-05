import {useEffect, useLayoutEffect} from 'react';

const storagePrefix = 'six-cities-scroll:';

export function useScrollRestoration(key: string): void {
  useLayoutEffect(() => {
    const savedPosition = Number(sessionStorage.getItem(`${storagePrefix}${key}`));
    if (Number.isFinite(savedPosition) && savedPosition > 0) window.scrollTo(0, savedPosition);
  }, [key]);

  useEffect(() => () => {
    sessionStorage.setItem(`${storagePrefix}${key}`, String(window.scrollY));
  }, [key]);
}
