import type {Offer} from './types';

export type OfferCardProps = {
  active?: boolean;
  offer: Offer;
  onActive?: (id: string | null) => void;
  row?: boolean;
};
