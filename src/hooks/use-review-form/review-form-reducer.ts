export type ReviewFormState = {
  rating: number;
};

export type ReviewFormAction =
  | {type: 'set-rating'; rating: number}
  | {type: 'reset'};

export const initialReviewFormState: ReviewFormState = {rating: 0};

export function reviewFormReducer(state: ReviewFormState, action: ReviewFormAction): ReviewFormState {
  if (action.type === 'set-rating') return {rating: action.rating};
  if (action.type === 'reset') return initialReviewFormState;
  return state;
}
