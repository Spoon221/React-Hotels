import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useSearchParams} from 'react-router';
import {setCity, type AppDispatch, type RootState} from '../../app/store';
import {cities, type CityName} from '../../entities/offer/model/types';
import {OfferCard} from '../../entities/offer/ui/offer-card';
import {useDebouncedValue} from '../../hooks/use-debounced-value/use-debounced-value';
import {useKeydown} from '../../hooks/use-keydown/use-keydown';
import {useMediaQuery} from '../../hooks/use-media-query/use-media-query';
import {useOutsideClick} from '../../hooks/use-outside-click/use-outside-click';
import {usePagedList} from '../../hooks/use-paged-list/use-paged-list';
import {useRecentlyViewed} from '../../hooks/use-recently-viewed/use-recently-viewed';
import {useScrollRestoration} from '../../hooks/use-scroll-restoration/use-scroll-restoration';
import {useUrlState} from '../../hooks/use-url-state/use-url-state';
import {NotFoundPage} from '../not-found/not-found-page';
import {OfferMap} from '../../widgets/offer-map/offer-map';

const sorts = ['Popular', 'Price: low to high', 'Price: high to low', 'Top rated first'] as const;
type Sort = typeof sorts[number];

function isCity(value: string | null): value is CityName {
  return value !== null && cities.includes(value as CityName);
}

function isSort(value: string): value is Sort {
  return sorts.includes(value as Sort);
}

export function MainPage() {
  const dispatch = useDispatch<AppDispatch>();
  const city = useSelector((state: RootState) => state.app.city);
  const allOffers = useSelector((state: RootState) => state.app.offers);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useUrlState('search');
  const [sortFromUrl, setSort] = useUrlState('sort', 'Popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeOfferId, setActiveOfferId] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const cityFromUrl = searchParams.get('city');
  const debouncedSearch = useDebouncedValue(search, 400);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const sort: Sort = isSort(sortFromUrl) ? sortFromUrl : 'Popular';
  const closeSort = useCallback(() => setIsSortOpen(false), []);

  useOutsideClick(sortRef, isSortOpen, closeSort);
  useKeydown('Escape', isSortOpen, closeSort);

  const offers = useMemo(() => {
    const filteredOffers = allOffers.filter((offer) => (
      offer.city === city && offer.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    ));

    return filteredOffers.sort((first, second) => {
      if (sort === 'Price: low to high') return first.price - second.price;
      if (sort === 'Price: high to low') return second.price - first.price;
      if (sort === 'Top rated first') return second.rating - first.rating;
      return 0;
    });
  }, [allOffers, city, debouncedSearch, sort]);
  const {hasMore, sentinelRef, visibleItems} = usePagedList(offers, 6, `${city}:${search}:${sort}`);
  const {recentlyViewed} = useRecentlyViewed(allOffers, 4);

  useScrollRestoration(`main:${city}:${search}:${sort}`);

  useEffect(() => {
    if (isCity(cityFromUrl) && cityFromUrl !== city) {
      dispatch(setCity(cityFromUrl));
    }
  }, [city, cityFromUrl, dispatch]);

  function selectCity(selectedCity: CityName) {
    dispatch(setCity(selectedCity));
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set('city', selectedCity);
      return nextParams;
    });
  }

  if (cityFromUrl && !isCity(cityFromUrl)) {
    return <NotFoundPage/>;
  }

  return (
    <main className="page__main">
      <title>Six Cities - {city}</title>
      <h1 className="visually-hidden">Cities</h1>
      <nav className="cities">
        <div className="container">
          <ul className="cities__list">
            {cities.map((item) => (
              <li key={item}>
                <button
                  className={`cities__link${city === item ? ' cities__link--active' : ''}`}
                  type="button"
                  onClick={() => selectCity(item)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="container places-layout">
        <div className="view-switch">
          <button className={`view-switch__label${!isMapVisible ? ' view-switch__label--active' : ''}`} type="button" aria-pressed={!isMapVisible} onClick={() => setIsMapVisible(false)}>List</button>
          <button className={`view-switch__label${isMapVisible ? ' view-switch__label--active' : ''}`} type="button" aria-pressed={isMapVisible} onClick={() => setIsMapVisible(true)}>Map</button>
        </div>
        {(isDesktop || isMapVisible) && <section className="places-layout__map">
          <OfferMap offers={offers} active={activeOfferId} onActive={setActiveOfferId}/>
        </section>}
        {(isDesktop || !isMapVisible) && <section className="places places-layout__list">
          <div className="places__head">
            <h2 className="places__title">{offers.length} places to stay in {city}</h2>
            <div className="places__tools">
              <label className="search">
                <span className="visually-hidden">Search by title</span>
                <input className="field search__input" type="search" placeholder="Search by title" value={search} onChange={(event) => setSearch(event.target.value, {replace: true})}/>
              </label>
              <div className={`sort${isSortOpen ? ' sort--opened' : ''}`} ref={sortRef}>
                <span className="sort__caption">Sort by</span>
                <button className="sort__current" type="button" onClick={() => setIsSortOpen(!isSortOpen)}>{sort}</button>
                <ul className="sort__list" role="listbox">
                  {sorts.map((item) => (
                    <li className={`sort__option${item === sort ? ' sort__option--active' : ''}`} key={item} role="option" aria-selected={item === sort} onClick={() => { setSort(item); closeSort(); }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {offers.length ? <>
            <div className="places-grid">
              {visibleItems.map((offer) => <OfferCard key={offer.id} offer={offer} active={activeOfferId === offer.id} onActive={setActiveOfferId}/>) }
            </div>
            {hasMore && <div className="places__more" ref={sentinelRef}>Scroll down — more places will load</div>}
            {recentlyViewed.length > 0 && <section className="recent">
              <h2 className="recent__title">Recently viewed</h2>
              <div className="recent__list">
                {recentlyViewed.map((offer) => <OfferCard key={`recent-${offer.id}`} offer={offer}/>) }
              </div>
            </section>}
          </> : <div className="empty">
            <img className="empty__image" src="/img/no-places.svg" alt=""/>
            <p className="empty__title">No places to stay available</p>
          </div>}
        </section>}
      </div>
    </main>
  );
}
