import {useState, type FormEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link, Navigate, useNavigate} from 'react-router';
import {setCity, setSession, type AppDispatch, type RootState} from '../../app/store';
import {login} from '../../entities/offer/api/load-offers';

export function LoginPage() {
  const user = useSelector((state: RootState) => state.app.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace/>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      dispatch(setSession(await login(email, password)));
      navigate('/');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page__main">
      <title>Six Cities - Login</title>
      <div className="container login">
        <section className="login__panel">
          <h1 className="login__title">Sign in</h1>
          <form className="login__form" onSubmit={submit}>
            <div className="login__group">
              <label className="login__label" htmlFor="login-email">E-mail</label>
              <input className="field" id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)}/>
            </div>
            <div className="login__group">
              <label className="login__label" htmlFor="login-password">Password</label>
              <input className={`field${error ? ' field--error' : ''}`} id="login-password" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)}/>
              <p className="login__hint">Password must contain at least one letter and one digit</p>
              {error && <p className="form-error">{error}</p>}
            </div>
            <button className="button login__submit" disabled={isSubmitting}>Sign in</button>
          </form>
          <p className="register">Don’t have an account? <Link to="/register">Create account</Link></p>
        </section>
        <button className="login__city" type="button" onClick={() => { dispatch(setCity('Paris')); navigate('/'); }}>
          <img className="login__city-image" src="/img/offers/15.jpg" alt=""/>
          <span className="login__city-text"><span className="login__city-caption">Explore</span><span className="login__city-name">Paris</span></span>
        </button>
      </div>
    </main>
  );
}
