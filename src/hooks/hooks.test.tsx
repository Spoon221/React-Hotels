import {act, fireEvent, render, renderHook, waitFor} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {Offer} from '../entities/offer/model/types';
import {useDebouncedValue} from './use-debounced-value/use-debounced-value';
import {useKeydown} from './use-keydown/use-keydown';
import {useMediaQuery} from './use-media-query/use-media-query';
import {useOfferLoader} from './use-offer-loader/use-offer-loader';
import {useOnlineStatus} from './use-online-status/use-online-status';
import {useOutsideClick} from './use-outside-click/use-outside-click';
import {usePagedList} from './use-paged-list/use-paged-list';
import {usePersistentState} from './use-persistent-state/use-persistent-state';
import {useRecentlyViewed} from './use-recently-viewed/use-recently-viewed';
import {initialReviewFormState, reviewFormReducer} from './use-review-form/review-form-reducer';
import {useReviewForm} from './use-review-form/use-review-form';
import {useScrollRestoration} from './use-scroll-restoration/use-scroll-restoration';
import {useUrlState} from './use-url-state/use-url-state';

const offer: Offer = {
  adults: 2, bedrooms: 1, city: 'Amsterdam', favorite: false, goods: [], id: 'offer-1', image: '/offer.jpg', premium: false, price: 100, rating: 4, title: 'Canal home', type: 'apartment',
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => vi.useRealTimers());

describe('state hooks', () => {
  it('debounces a changing value and clears the previous timer', () => {
    vi.useFakeTimers();
    const {result, rerender} = renderHook(({value}) => useDebouncedValue(value, 300), {initialProps: {value: 'a'}});
    rerender({value: 'ab'});
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('ab');
  });

  it('persists review draft state and restores it', () => {
    const {result, unmount} = renderHook(() => usePersistentState('draft', ''));
    act(() => result.current[1]('Saved text'));
    expect(localStorage.getItem('draft')).toBe(JSON.stringify('Saved text'));
    unmount();
    expect(renderHook(() => usePersistentState('draft', '')).result.current[0]).toBe('Saved text');
  });

  it('tracks and resolves recently viewed offers', () => {
    const {result} = renderHook(() => useRecentlyViewed([offer], 2));
    act(() => result.current.markViewed(offer.id));
    expect(result.current.recentlyViewed).toEqual([offer]);
    expect(localStorage.getItem('six-cities-recently-viewed')).toBe(JSON.stringify([offer.id]));
  });

  it('uses a reducer for the review rating and validates a complete review', () => {
    expect(reviewFormReducer(initialReviewFormState, {rating: 4, type: 'set-rating'})).toEqual({rating: 4});
    expect(reviewFormReducer({rating: 4}, {type: 'reset'})).toEqual(initialReviewFormState);
    const {result} = renderHook(() => useReviewForm('review'));
    act(() => result.current.setRating(5));
    act(() => result.current.setText('A'.repeat(50)));
    expect(result.current.isValid).toBe(true);
    act(() => result.current.reset());
    expect(result.current).toMatchObject({isValid: false, rating: 0, text: ''});
  });
});

describe('external and DOM hooks', () => {
  it('subscribes to online and offline events', () => {
    let online = true;
    vi.spyOn(window.navigator, 'onLine', 'get').mockImplementation(() => online);
    const {result} = renderHook(useOnlineStatus);
    expect(result.current).toBe(true);
    online = false;
    act(() => window.dispatchEvent(new Event('offline')));
    expect(result.current).toBe(false);
  });

  it('reacts to a media query change', () => {
    let listener: (() => void) | undefined;
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      addEventListener: (_: string, callback: () => void) => { listener = callback; },
      matches: false,
      removeEventListener: vi.fn(),
    })));
    const {result} = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
    listener?.();
    expect(result.current).toBe(false);
  });

  it('invokes keyboard and outside click handlers with cleanup', () => {
    const keyHandler = vi.fn();
    const outsideHandler = vi.fn();
    function Fixture() {
      const element = useRef<HTMLDivElement>(null);
      useKeydown('Escape', true, keyHandler);
      useOutsideClick(element, true, outsideHandler);
      return <><div ref={element}>inside</div><button type="button">outside</button></>;
    }
    const {getByRole, getByText} = render(<Fixture/>);
    fireEvent.keyDown(document, {key: 'Escape'});
    fireEvent.pointerDown(getByText('inside'));
    fireEvent.pointerDown(getByRole('button'));
    expect(keyHandler).toHaveBeenCalledTimes(1);
    expect(outsideHandler).toHaveBeenCalledTimes(1);
  });

  it('restores the saved scroll position', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    sessionStorage.setItem('six-cities-scroll:main', '240');
    renderHook(() => useScrollRestoration('main'));
    expect(scrollTo).toHaveBeenCalledWith(0, 240);
  });
});

describe('async and collection hooks', () => {
  it('loads an offer and retries a failed request', async () => {
    const request = vi.fn().mockRejectedValueOnce(new Error('Failed')).mockResolvedValueOnce(offer);
    const {result} = renderHook(() => useOfferLoader('offer-1', request));
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current).toMatchObject({offer, status: 'success'}));
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('shows a page and extends it when its sentinel intersects', () => {
    let callback: IntersectionObserverCallback = () => undefined;
    class Observer {
      constructor(nextCallback: IntersectionObserverCallback) { callback = nextCallback; }
      disconnect() {}
      observe() {}
      root = null;
      rootMargin = '';
      thresholds = [];
      takeRecords = () => [];
      unobserve() {}
    }
    vi.stubGlobal('IntersectionObserver', Observer);
    let visibleItems: readonly number[] = [];
    function Fixture() {
      const list = usePagedList([1, 2, 3], 1, 'first');
      visibleItems = list.visibleItems;
      return <div ref={list.sentinelRef}/>;
    }
    render(<Fixture/>);
    expect(visibleItems).toEqual([1]);
    act(() => callback([{isIntersecting: true} as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(visibleItems).toEqual([1, 2]);
  });
});

it('keeps URL state in the active router location', () => {
  let current = '';
  function Page() {
    const [value, setValue] = useUrlState('search');
    current = value;
    return <button type="button" onClick={() => setValue('flat')}>set</button>;
  }
  const router = createMemoryRouter([{element: <Page/>, path: '/'}], {initialEntries: ['/']});
  const {getByRole} = render(<RouterProvider router={router}/>);
  fireEvent.click(getByRole('button', {name: 'set'}));
  expect(current).toBe('flat');
  expect(router.state.location.search).toBe('?search=flat');
});
