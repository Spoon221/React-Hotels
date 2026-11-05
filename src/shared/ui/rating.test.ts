import {describe, expect, it} from 'vitest';
import {ratingStyle} from './rating';

describe('ratingStyle', () => {
  it('converts a five-point rating to the fill percentage used by the UI', () => {
    expect(ratingStyle(4)).toEqual({'--rating': '80%'});
    expect(ratingStyle(3.7)).toEqual({'--rating': '80%'});
  });
});
