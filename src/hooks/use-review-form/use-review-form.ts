import {useCallback, useReducer} from 'react';
import {usePersistentState} from '../use-persistent-state/use-persistent-state';
import {initialReviewFormState, reviewFormReducer} from './review-form-reducer';

export function useReviewForm(storageKey: string) {
  const [state, dispatch] = useReducer(reviewFormReducer, initialReviewFormState);
  const [text, setText] = usePersistentState(storageKey, '');
  const isValid = state.rating > 0 && text.trim().length >= 50;

  const reset = useCallback(() => {
    dispatch({type: 'reset'});
    setText('');
  }, [setText]);

  return {
    isValid,
    rating: state.rating,
    reset,
    setRating: (rating: number) => dispatch({rating, type: 'set-rating'}),
    setText,
    text,
  };
}
