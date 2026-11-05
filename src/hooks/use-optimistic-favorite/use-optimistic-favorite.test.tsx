import {act, renderHook, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {updateFavorite} from '../../entities/offer/api/load-offers';
import type {Offer} from '../../entities/offer/model/types';
import {useOptimisticFavorite} from './use-optimistic-favorite';

vi.mock('../../entities/offer/api/load-offers', () => ({updateFavorite: vi.fn()}));

const offer: Offer = {
  adults: 2, bedrooms: 1, city: 'Amsterdam', favorite: false, goods: [], id: 'offer-1', image: '/offer.jpg', premium: false, price: 100, rating: 4, title: 'Canal home', type: 'apartment',
};

describe('useOptimisticFavorite', () => {
  it('redirects unauthenticated users without a request', () => {
    const onUnauthorized = vi.fn();
    const {result} = renderHook(() => useOptimisticFavorite({offer, onUnauthorized, onUpdated: vi.fn(), token: null}));

    act(() => result.current.toggleFavorite());

    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(updateFavorite).not.toHaveBeenCalled();
  });

  it('optimistically changes a favorite and saves the server response', async () => {
    const updatedOffer = {...offer, favorite: true};
    const onUpdated = vi.fn();
    vi.mocked(updateFavorite).mockResolvedValueOnce(updatedOffer);
    const {result} = renderHook(() => useOptimisticFavorite({offer, onUnauthorized: vi.fn(), onUpdated, token: 'token'}));

    act(() => result.current.toggleFavorite());

    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(updatedOffer));
    expect(updateFavorite).toHaveBeenCalledWith(offer.id, true, 'token');
  });

  it('returns an error and lets React revert the optimistic state when saving fails', async () => {
    vi.mocked(updateFavorite).mockRejectedValueOnce(new Error('Server unavailable'));
    const {result} = renderHook(() => useOptimisticFavorite({offer, onUnauthorized: vi.fn(), onUpdated: vi.fn(), token: 'token'}));

    act(() => result.current.toggleFavorite());

    await waitFor(() => expect(result.current.error?.message).toBe('Server unavailable'));
    expect(result.current.favorite).toBe(false);
  });
});
