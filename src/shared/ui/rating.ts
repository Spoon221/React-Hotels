import type {CSSProperties} from 'react';

export const ratingStyle = (rating: number): CSSProperties => (
  {'--rating': `${Math.round(rating) * 20}%`} as CSSProperties
);
