import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Offer} from '../../entities/offer/model/types';

const storageKey = 'six-cities-recently-viewed';

function readIds(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(value) && value.every((id) => typeof id === 'string') ? value : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed(offers: readonly Offer[], recentCount: number) {
  const [ids, setIds] = useState<string[]>(readIds);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(ids));
  }, [ids]);

  const markViewed = useCallback((id: string) => {
    setIds((currentIds) => [id, ...currentIds.filter((currentId) => currentId !== id)].slice(0, recentCount));
  }, [recentCount]);

  const recentlyViewed = useMemo(() => ids
    .map((id) => offers.find((offer) => offer.id === id))
    .filter((offer): offer is Offer => offer !== undefined), [ids, offers]);

  return {markViewed, recentlyViewed};
}
