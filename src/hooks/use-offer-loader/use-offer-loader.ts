import {useCallback, useEffect, useState} from 'react';
import type {Offer} from '../../entities/offer/model/types';

export type OfferLoadStatus = 'idle' | 'loading' | 'success' | 'error';
type OfferRequest = (id: string, signal: AbortSignal) => Promise<Offer>;

export function useOfferLoader(id: string | undefined, request: OfferRequest) {
  const [result, setResult] = useState<{error: Error | null; id: string; offer: Offer | null; status: OfferLoadStatus} | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((currentAttempt) => currentAttempt + 1), []);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    request(id, controller.signal)
      .then((loadedOffer) => {
        if (!controller.signal.aborted) {
          setResult({error: null, id, offer: loadedOffer, status: 'success'});
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setResult({
            error: reason instanceof Error ? reason : new Error('Unable to load offer.'),
            id,
            offer: null,
            status: 'error',
          });
        }
      });

    return () => controller.abort();
  }, [attempt, id, request]);

  const isCurrentResult = result?.id === id;
  return {
    error: isCurrentResult ? result?.error ?? null : null,
    offer: isCurrentResult ? result?.offer ?? null : null,
    retry,
    status: id ? (isCurrentResult ? result?.status ?? 'loading' : 'loading') : 'idle',
  };
}
