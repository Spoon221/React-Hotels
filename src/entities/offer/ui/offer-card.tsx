import {Link} from 'react-router';
import {FavoriteButton} from '../../../features/favorites/favorite-button';
import {ratingStyle} from '../../../shared/ui/rating';
import type {OfferCardProps} from '../model/offer-card-props';

export function OfferCard({offer, active, onActive, row = false}: OfferCardProps) {
  return (
    <article
      className={`place-card${row ? ' place-card--row' : ''}${active ? ' place-card--active' : ''}`}
      onMouseEnter={() => onActive?.(offer.id)}
      onMouseLeave={() => onActive?.(null)}
      onFocus={() => onActive?.(offer.id)}
      onBlur={() => onActive?.(null)}
    >
      <div className="place-card__image-wrapper">
        <img className="place-card__image" src={offer.image} width="400" height="300" alt={offer.type}/>
        {offer.premium && <span className="badge place-card__badge">Premium</span>}
      </div>
      <div className="place-card__info">
        <p className="place-card__price"><b>€{offer.price}</b> / night</p>
        <div className="rating" aria-label={`Rating ${offer.rating} of 5`}>
          <span className="rating__fill" style={ratingStyle(offer.rating)}/>
        </div>
        <h3 className="place-card__title"><Link to={`/offer/${offer.id}`}>{offer.title}</Link></h3>
        <p className="place-card__type">{offer.type}</p>
      </div>
      <FavoriteButton className="bookmark place-card__bookmark" offer={offer}>
        <span className="visually-hidden">Toggle favorite</span>
      </FavoriteButton>
    </article>
  );
}
