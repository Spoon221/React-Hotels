import {useCallback, useOptimistic, useState, useTransition} from 'react';
import {updateFavorite} from '../../entities/offer/api/load-offers';
import type {Offer} from '../../entities/offer/model/types';

type Options = {
  offer: Offer;
  onUnauthorized: () => void;
  onUpdated: (offer: Offer) => void;
  token: string | null;
};

export function useOptimisticFavorite({offer, onUnauthorized, onUpdated, token}: Options) {
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(offer.favorite);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  const toggleFavorite = useCallback(() => {
    if (!token) {
      onUnauthorized();
      return;
    }

    const nextFavorite = !optimisticFavorite;
    startTransition(async () => {
      setError(null);
      setOptimisticFavorite(nextFavorite);
      try {
        const updatedOffer = await updateFavorite(offer.id, nextFavorite, token);
        onUpdated(updatedOffer);
      } catch (reason) {
        setError(reason instanceof Error ? reason : new Error('Unable to update favorites.'));
      }
    });
  }, [offer.id, onUnauthorized, onUpdated, optimisticFavorite, setOptimisticFavorite, startTransition, token]);

  return {error, favorite: optimisticFavorite, isPending, toggleFavorite};
}
