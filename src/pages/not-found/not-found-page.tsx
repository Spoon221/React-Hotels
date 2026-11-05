import type {JSX} from 'react';
import {Link} from 'react-router';

export function NotFoundPage(): JSX.Element {
  return (
    <main className="page__main page__main--not-found">
      <title>Six Cities - 404</title>
      <section className="container not-found">
        <img className="not-found__image" src="/img/illustration-404.svg" alt=""/>
        <h1 className="not-found__title"><span className="not-found__code">404</span> Not Found</h1>
        <p className="not-found__text">The page you are looking for does not exist or has been moved. Let’s get you back to the list of places.</p>
        <Link className="button not-found__button" to="/">Back to main page</Link>
      </section>
    </main>
  );
}
