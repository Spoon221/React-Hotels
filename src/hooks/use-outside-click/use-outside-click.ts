import {useEffect, useEffectEvent, type RefObject} from 'react';

export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  isEnabled: boolean,
  onOutsideClick: () => void,
): void {
  const handleOutsideClick = useEffectEvent(onOutsideClick);

  useEffect(() => {
    if (!isEnabled) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) {
        handleOutsideClick();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isEnabled, ref]);
}
