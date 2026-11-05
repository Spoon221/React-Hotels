import type {Offer} from '../../../entities/offer/model/types';

export type OfferMapProps = {
  active?: string | null;
  offers: Offer[];
  onActive?: (id: string | null) => void;
};
