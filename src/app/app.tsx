import {StrictMode, useEffect, useEffectEvent, type JSX, type ReactNode} from 'react';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {createBrowserRouter, RouterProvider, useLocation} from 'react-router';
import {getCurrentUser, loadRemoteOffers} from '../entities/offer/api/load-offers';
import type {Offer} from '../entities/offer/model/types';
import {FavoritesPage} from '../pages/favorites/favorites-page';
import {LoginPage} from '../pages/login/login-page';
import {MainPage} from '../pages/main/main-page';
import {NotFoundPage} from '../pages/not-found/not-found-page';
import {OfferPage} from '../pages/offer/offer-page';
import {RegisterPage} from '../pages/register/register-page';
import {IconsSprite} from '../shared/ui/icons-sprite';
import {Footer} from '../widgets/footer/footer';
import {Header} from '../widgets/header/header';
import {useOnlineStatus} from '../hooks/use-online-status/use-online-status';
import {
  clearSession,
  sessionStorageKey,
  setOffers,
  setUser,
  store,
  type AppDispatch,
  type RootState,
} from './store';
import '../styles/favorites.css';
import '../styles/global.css';
import '../styles/interactions.css';
import '../styles/login.css';
import '../styles/main-empty.css';
import '../styles/main.css';
import '../styles/not-found.css';
import '../styles/offer.css';

function ScrollToTop() {
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Layout({children}: {children: ReactNode}) {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.app.token);
  const isOnline = useOnlineStatus();
  const handleOffersLoaded = useEffectEvent((offers: Offer[]) => dispatch(setOffers(offers)));

  useEffect(() => {
    const controller = new AbortController();

    loadRemoteOffers(token, controller.signal)
      .then((offers) => {
        if (!controller.signal.aborted) handleOffersLoaded(offers);
      })
      .catch(() => {
        if (!controller.signal.aborted) dispatch(setOffers([]));
      });

    return () => controller.abort();
  }, [dispatch, token]);

  useEffect(() => {
    if (!token) {
      window.localStorage.removeItem(sessionStorageKey);
      return;
    }

    window.localStorage.setItem(sessionStorageKey, token);
    const controller = new AbortController();

    getCurrentUser(token, controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) dispatch(setUser(user));
      })
      .catch(() => {
        if (!controller.signal.aborted) dispatch(clearSession());
      });

    return () => controller.abort();
  }, [dispatch, token]);

  return (
    <div className="page">
      <ScrollToTop/>
      <IconsSprite/>
      {!isOnline && <p className="offline-bar" role="status">No connection. Changes will be retried when you are online.</p>}
      <Header/>
      {children}
      <Footer/>
    </div>
  );
}

const router = createBrowserRouter([
  {path: '/', element: <Layout><MainPage/></Layout>},
  {path: '/login', element: <Layout><LoginPage/></Layout>},
  {path: '/register', element: <Layout><RegisterPage/></Layout>},
  {path: '/favorites', element: <Layout><FavoritesPage/></Layout>},
  {path: '/offer/:id', element: <Layout><OfferPage/></Layout>},
  {path: '*', element: <Layout><NotFoundPage/></Layout>},
]);

export function App(): JSX.Element {
  return (
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router}/>
      </Provider>
    </StrictMode>
  );
}
