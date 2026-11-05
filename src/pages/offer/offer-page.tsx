import {useEffect, useState, type FormEvent} from 'react';
import {useSelector} from 'react-redux';
import {Link, useParams} from 'react-router';
import {type RootState} from '../../app/store';
import {createReview, loadOffer, loadReviews} from '../../entities/offer/api/load-offers';
import type {Review} from '../../entities/offer/model/types';
import {OfferCard} from '../../entities/offer/ui/offer-card';
import {FavoriteButton} from '../../features/favorites/favorite-button';
import {useOfferLoader} from '../../hooks/use-offer-loader/use-offer-loader';
import {useRecentlyViewed} from '../../hooks/use-recently-viewed/use-recently-viewed';
import {useReviewForm} from '../../hooks/use-review-form/use-review-form';
import {NotFoundPage} from '../not-found/not-found-page';
import {Icon} from '../../shared/ui/icon';
import {ratingStyle} from '../../shared/ui/rating';
import {OfferMap} from '../../widgets/offer-map/offer-map';

export function OfferPage() {
  const {id} = useParams();
  const {offers, token, user} = useSelector((state: RootState) => state.app);
  const cachedOffer = offers.find((item) => item.id === id);
  const loadedOffer = useOfferLoader(id, loadOffer);
  const offer = cachedOffer ?? loadedOffer.offer;
  const [reviews, setReviews] = useState<Review[]>([]);
  const {isValid, rating, reset, setRating, setText, text} = useReviewForm(`six-cities-review-draft-${id ?? 'new'}`);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeMapOfferId, setActiveMapOfferId] = useState<string | null>(null);
  const photos = offer?.photos?.length ? offer.photos : offer ? [offer.image] : [];
  const {markViewed} = useRecentlyViewed(offers, 4);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    loadReviews(id, controller.signal)
      .then((loadedReviews) => {
        if (!controller.signal.aborted) setReviews(loadedReviews);
      })
      .catch(() => {
        if (!controller.signal.aborted) setReviews([]);
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (offer) markViewed(offer.id);
  }, [markViewed, offer]);

  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedPhotoIndex(null);
      if (event.key === 'ArrowLeft') {
        setSelectedPhotoIndex((index) => index === null ? null : (index - 1 + photos.length) % photos.length);
      }
      if (event.key === 'ArrowRight') {
        setSelectedPhotoIndex((index) => index === null ? null : (index + 1) % photos.length);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [photos.length, selectedPhotoIndex]);

  if (!offer && loadedOffer.status === 'loading') {
    return <main className="page__main"><div className="container empty"><p className="empty__title">Loading offer…</p></div></main>;
  }

  if (!offer && loadedOffer.status === 'error') {
    return <main className="page__main"><section className="container empty"><p className="empty__title">Unable to load this offer</p><button className="button" type="button" onClick={loadedOffer.retry}>Retry</button></section></main>;
  }

  if (!offer) return <NotFoundPage/>;

  const offerId = offer.id;
  const nearby = offers.filter((item) => item.city === offer.city && item.id !== offer.id).slice(0, 3);
  const selectedPhoto = selectedPhotoIndex === null ? null : photos[selectedPhotoIndex];
  const mapActiveOfferId = activeMapOfferId ?? offer.id;

  function closeGallery() {
    setSelectedPhotoIndex(null);
  }

  function showPreviousPhoto() {
    setSelectedPhotoIndex((index) => index === null ? null : (index - 1 + photos.length) % photos.length);
  }

  function showNextPhoto() {
    setSelectedPhotoIndex((index) => index === null ? null : (index + 1) % photos.length);
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setIsSubmittingReview(true);
    try {
      const review = await createReview(offerId, {rating, text}, token);
      setReviews((currentReviews) => [review, ...currentReviews]);
      reset();
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <main className="page__main offer">
      <title>Six Cities - {offer.title}</title>
      <div className="container">
        <ul className="gallery">
          {photos.map((image, index) => (
            <li className="gallery__item" key={image}>
              <button className="gallery__button" type="button" onClick={() => setSelectedPhotoIndex(index)}>
                <img className="gallery__image" src={image} alt="Interior"/>
                <span className="gallery__zoom">Open image</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selectedPhotoIndex !== null && selectedPhoto && <div className="gallery-modal" role="presentation" onMouseDown={closeGallery}>
        <section className="gallery-modal__dialog" role="dialog" aria-modal="true" aria-label="Offer gallery" onMouseDown={(event) => event.stopPropagation()}>
          <img className="gallery-modal__image" src={selectedPhoto} alt={`Interior ${selectedPhotoIndex + 1}`}/>
          <button className="gallery-modal__close" type="button" aria-label="Close gallery" onClick={closeGallery}>×</button>
          {photos.length > 1 && <>
            <button className="gallery-modal__previous" type="button" aria-label="Previous image" onClick={showPreviousPhoto}>‹</button>
            <button className="gallery-modal__next" type="button" aria-label="Next image" onClick={showNextPhoto}>›</button>
          </>}
          <p className="gallery-modal__counter">{selectedPhotoIndex + 1} / {photos.length}</p>
        </section>
      </div>}
      <div className="container offer__layout">
        <div className="offer__head">
          {offer.premium && <span className="badge offer__badge">Premium</span>}
          <h1 className="offer__title">{offer.title}</h1>
          <div className="offer__rating">
            <div className="rating rating--large"><span className="rating__fill" style={ratingStyle(offer.rating)}/></div>
            <span className="offer__rating-value">{offer.rating}</span>
          </div>
          <ul className="offer__features">
            <li className="offer__feature offer__feature--type">{offer.type}</li>
            <li className="offer__feature offer__feature--bedrooms">{offer.bedrooms} Bedroom{offer.bedrooms > 1 ? 's' : ''}</li>
            <li className="offer__feature offer__feature--adults">Max {offer.adults} adult{offer.adults > 1 ? 's' : ''}</li>
          </ul>
        </div>
        <aside className="offer__aside">
          <div className="offer-summary">
            <p className="offer-summary__price"><b>€{offer.price}</b> / night</p>
            <FavoriteButton className="bookmark offer-summary__bookmark" offer={offer}/>
          </div>
        </aside>
        <div className="offer__details">
          <section className="offer__section">
            <h2 className="offer__section-title">What’s inside</h2>
            <ul className="goods">{offer.goods.map((good) => <li className="goods__item" key={good}>{good}</li>)}</ul>
          </section>
          <section className="offer__section">
            <h2 className="offer__section-title">Meet the host</h2>
            <div className="host host--pro">
              <div className="host__user">
                <div className="host__avatar-wrapper"><img className="host__avatar" src="/img/avatars/avatar-angelina.svg" alt=""/><Icon name="star" className="host__pro-icon"/></div>
                <div><p className="host__name">Angelina</p><p className="host__status">Pro</p></div>
              </div>
              <div className="host__description"><p>A quiet cozy and picturesque home, strategically located in the heart of the city, where the bustle comes to rest.</p></div>
            </div>
          </section>
          <section className="offer__section reviews">
            <h2 className="offer__section-title">Reviews · {reviews.length}</h2>
            <ul className="reviews__list">
              {reviews.map((review) => (
                <li className="review" key={review.id}>
                  <img className="review__avatar" src={review.avatar} alt=""/>
                  <div className="review__body">
                    <div className="review__head"><p className="review__name">{review.name}</p><time className="review__date">{review.date}</time></div>
                    <div className="rating"><span className="rating__fill" style={ratingStyle(review.rating)}/></div>
                    <p className="review__text">{review.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            {user ? <form className="review-form" onSubmit={submitReview}>
              <h3 className="review-form__title">Your review</h3>
              <fieldset className="rating-input">
                <legend className="rating-input__legend">Your rating</legend>
                <div className="rating-input__stars">
                  {[1, 2, 3, 4, 5].map((value) => <label className="rating-input__star" key={value}><input className="rating-input__control" type="radio" name="rating" checked={rating === value} onChange={() => setRating(value)}/><Icon name="star"/></label>)}
                </div>
              </fieldset>
              <textarea className="field review-form__textarea" rows={5} value={text} placeholder="Tell how was your stay, what you like and what can be improved" onChange={(event) => setText(event.target.value)}/>
              <div className="review-form__footer"><p className="review-form__hint">To submit review please make sure to set rating and describe your stay with at least <b>50 characters</b>.</p><button className="button review-form__submit" disabled={isSubmittingReview || !isValid}>Submit</button></div>
            </form> : <p className="reviews__login"><Link to="/login">Sign in</Link> to leave a review</p>}
          </section>
        </div>
      </div>
      <section className="container offer__map"><OfferMap offers={[offer, ...nearby]} active={mapActiveOfferId} onActive={setActiveMapOfferId}/></section>
      <section className="container near-places"><h2 className="near-places__title">Other places in the neighbourhood</h2><div className="places-grid near-places__list">{nearby.map((item) => <OfferCard key={item.id} offer={item}/>)}</div></section>
    </main>
  );
}
