import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router';
import {replaceOffer, type AppDispatch, type RootState} from '../../app/store';
import {useOptimisticFavorite} from '../../hooks/use-optimistic-favorite/use-optimistic-favorite';
import {Icon} from '../../shared/ui/icon';
import type {Offer} from '../../entities/offer/model/types';
import type {FavoriteButtonProps} from './model/favorite-button-props';

export function FavoriteButton({className, offer, children}: FavoriteButtonProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.app.token);
  const onUpdated = useCallback((updatedOffer: Offer) => dispatch(replaceOffer(updatedOffer)), [dispatch]);
  const onUnauthorized = useCallback(() => navigate('/login'), [navigate]);
  const {error, favorite, isPending, toggleFavorite} = useOptimisticFavorite({
    offer,
    onUnauthorized,
    onUpdated,
    token,
  });

  return <>
    <button
      className={`${className}${favorite ? ' bookmark--active' : ''}`}
      type="button"
      aria-pressed={favorite}
      disabled={isPending}
      onClick={toggleFavorite}
      title={error?.message}
    >
      <Icon name="bookmark"/>
      {children}
    </button>
    {error && <span className="visually-hidden" role="alert">{error.message}</span>}
  </>;
}
