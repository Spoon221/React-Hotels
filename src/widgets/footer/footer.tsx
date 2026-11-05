import type {JSX} from 'react';
import {Link} from 'react-router';

export function Footer(): JSX.Element {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Link className="logo" to="/">
          <img className="logo__mark" src="/img/logo.svg" width="32" height="32" alt=""/>
          <span className="logo__text">six<span>cities</span></span>
        </Link>
        <p>Учебный проект</p>
      </div>
    </footer>
  );
}
