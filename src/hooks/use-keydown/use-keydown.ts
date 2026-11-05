import {useEffect, useEffectEvent} from 'react';

export function useKeydown(key: string, isEnabled: boolean, handler: () => void): void {
  const handleKeyDownEvent = useEffectEvent(handler);

  useEffect(() => {
    if (!isEnabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === key) handleKeyDownEvent();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, key]);
}
