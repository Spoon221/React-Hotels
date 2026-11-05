import type {ComponentProps} from 'react';
import type {Offer} from '../../../entities/offer/model/types';

export type FavoriteButtonProps = {
  className: string;
  offer: Offer;
} & Pick<ComponentProps<'button'>, 'children'>;
