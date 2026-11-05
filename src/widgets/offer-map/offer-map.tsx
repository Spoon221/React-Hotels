import {Link} from 'react-router';
import {Icon} from '../../shared/ui/icon';
import type {OfferMapProps} from './model/offer-map-props';

export function OfferMap({offers, active, onActive}: OfferMapProps) {
  const activeOffer = offers.find((offer) => offer.id === active);

  return (
    <div className="map">
      {offers.map((offer, index) => (
        <Link
          key={offer.id}
          to={`/offer/${offer.id}`}
          className={`map__pin${active === offer.id ? ' map__pin--active' : ''}`}
          style={{
            left: `${18 + (index % 3) * 30}%`,
            top: `${20 + Math.floor(index / 3) * 28}%`,
          }}
          aria-label={`Open ${offer.title}`}
          onMouseEnter={() => onActive?.(offer.id)}
          onMouseLeave={() => onActive?.(null)}
          onFocus={() => onActive?.(offer.id)}
          onBlur={() => onActive?.(null)}
        >
          <Icon name="pin"/>
        </Link>
      ))}
      {activeOffer && <Link className="map__tooltip" to={`/offer/${activeOffer.id}`}>
        <img src={activeOffer.image} alt=""/>
        <span><b>{activeOffer.title}</b><small>€{activeOffer.price} / night</small></span>
      </Link>}
      <span className="map__note">Map</span>
    </div>
  );
}
