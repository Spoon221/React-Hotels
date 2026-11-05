import {useSelector} from 'react-redux';
import {Link, Navigate} from 'react-router';
import type {RootState} from '../../app/store';
import {OfferCard} from '../../entities/offer/ui/offer-card';
import {Icon} from '../../shared/ui/icon';

export function FavoritesPage() {
  const user = useSelector((state: RootState) => state.app.user);
  const favorites = useSelector((state: RootState) => state.app.offers.filter((offer) => offer.favorite));
  const grouped = favorites.reduce<Record<string, typeof favorites>>((groups, offer) => {
    groups[offer.city] ??= [];
    groups[offer.city].push(offer);
    return groups;
  }, {});

  if (!user) return <Navigate to="/login" replace/>;

  return (
    <main className="page__main">
      <title>Six Cities - Favorites ({favorites.length})</title>
      <div className={`container favorites${favorites.length ? '' : ' favorites--empty'}`}>
        {favorites.length ? <>
          <h1 className="favorites__title">Saved listing</h1>
          <ul className="favorites__list">
            {Object.entries(grouped).map(([city, offers]) => (
              <li className="favorites__group" key={city}>
                <section className="favorites__city">
                  <h2 className="favorites__city-title">
                    <Link className="favorites__city-link" to="/"><Icon name="pin"/>{city}</Link>
                  </h2>
                  <div className="favorites__places">
                    {offers.map((offer) => <OfferCard key={offer.id} offer={offer} row/>)}
                  </div>
                </section>
              </li>
            ))}
          </ul>
        </> : <section className="empty favorites__empty">
          <img className="empty__image" src="/img/nothing-saved.svg" alt=""/>
          <h1 className="empty__title">Nothing yet saved</h1>
          <p className="empty__text">Save properties to narrow down search or plan your future trips</p>
          <Link className="button favorites__find" to="/">Find a place</Link>
        </section>}
      </div>
    </main>
  );
}
