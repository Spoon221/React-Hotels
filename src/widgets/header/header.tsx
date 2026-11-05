import type {JSX} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router';
import {logout} from '../../entities/offer/api/load-offers';
import {clearSession, type AppDispatch, type RootState} from '../../app/store';
import {Icon} from '../../shared/ui/icon';

export function Header(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const {user, token, offers} = useSelector((state: RootState) => state.app);
  const favorites = offers.filter((offer) => offer.favorite).length;

  async function onSignOut() {
    if (token) await logout(token).catch(() => undefined);
    dispatch(clearSession());
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link className="logo" to="/">
          <img className="logo__mark" src="/img/logo.svg" width="32" height="32" alt=""/>
          <span className="logo__text">six<span>cities</span></span>
        </Link>
        <nav className="user-nav">
          {user ? <>
            <Link className="user-nav__link" to="/favorites">
              <img className="user-nav__avatar" src="/img/avatars/user-3.svg" width="32" height="32" alt=""/>
              <span className="user-nav__email">{user.email}</span>
              <span className="user-nav__count">{favorites}</span>
            </Link>
            <button className="user-nav__link user-nav__link--signout" type="button" aria-label="Sign out" title="Sign out" onClick={onSignOut}>
              <Icon name="logout"/>
              <span className="visually-hidden">Sign out</span>
            </button>
          </> : <Link className="user-nav__link" to="/login">Sign in</Link>}
        </nav>
      </div>
    </header>
  );
}
