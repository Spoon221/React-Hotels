import {configureStore, createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {CityName, Offer, Session, User} from '../../entities/offer/model/types';

type State = {
  offers: Offer[];
  city: CityName;
  user: User | null;
  token: string | null;
};

const sessionStorageKey = 'six-cities-session-token';
const initialToken = typeof window === 'undefined'
  ? null
  : window.localStorage.getItem(sessionStorageKey);

const initialState: State = {
  offers: [],
  city: 'Paris',
  user: null,
  token: initialToken,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOffers: (state, action: PayloadAction<Offer[]>) => {
      state.offers = action.payload;
    },
    replaceOffer: (state, action: PayloadAction<Offer>) => {
      const index = state.offers.findIndex((offer) => offer.id === action.payload.id);
      if (index !== -1) state.offers[index] = action.payload;
    },
    setCity: (state, action: PayloadAction<CityName>) => {
      state.city = action.payload;
    },
    setSession: (state, action: PayloadAction<Session>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearSession: (state) => {
      state.user = null;
      state.token = null;
      state.offers = state.offers.map((offer) => ({...offer, favorite: false}));
    },
  },
});

export const {clearSession, replaceOffer, setCity, setOffers, setSession, setUser} = appSlice.actions;
export {sessionStorageKey};
export const store = configureStore({reducer: {app: appSlice.reducer}});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
