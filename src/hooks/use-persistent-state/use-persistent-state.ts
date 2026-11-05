import {useEffect, useRef, useState, type Dispatch, type SetStateAction} from 'react';

function readValue<T>(key: string, initialValue: T): T {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? initialValue : JSON.parse(storedValue);
  } catch {
    return initialValue;
  }
}

/** A localStorage-backed state value that stays synchronized across tabs. */
export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readValue(key, initialValue));
  const activeKey = useRef(key);

  useEffect(() => {
    if (activeKey.current !== key) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (for example, in private browsing mode).
    }
  }, [key, value]);

  useEffect(() => {
    if (activeKey.current === key) return;
    activeKey.current = key;
    setValue(readValue(key, initialValue));
  }, [initialValue, key]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === key) setValue(readValue(key, initialValue));
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [initialValue, key]);

  return [value, setValue];
}
