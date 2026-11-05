import {useState, type FormEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link, Navigate, useNavigate} from 'react-router';
import {setSession, type AppDispatch, type RootState} from '../../app/store';
import {register} from '../../entities/offer/api/load-offers';

export function RegisterPage() {
  const user = useSelector((state: RootState) => state.app.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
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
      dispatch(setSession(await register(nickname, email, password)));
      navigate('/');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create an account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page__main">
      <title>Six Cities - Register</title>
      <div className="container login">
        <section className="login__panel">
          <h1 className="login__title">Create account</h1>
          <form className="login__form" onSubmit={submit}>
            <div className="login__group">
              <label className="login__label" htmlFor="nickname">Nickname</label>
              <input className="field" id="nickname" placeholder="Your name" value={nickname} onChange={(event) => setNickname(event.target.value)}/>
            </div>
            <div className="login__group">
              <label className="login__label" htmlFor="register-email">E-mail</label>
              <input className="field" id="register-email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)}/>
            </div>
            <div className="login__group">
              <label className="login__label" htmlFor="register-password">Password</label>
              <input className={`field${error ? ' field--error' : ''}`} id="register-password" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)}/>
              {error && <p className="form-error">{error}</p>}
            </div>
            <button className="button login__submit" disabled={isSubmitting}>Create account</button>
          </form>
          <p className="register">Already have an account? <Link to="/login">Sign in</Link></p>
        </section>
        <Link className="login__city" to="/">
          <img className="login__city-image" src="/img/offers/15.jpg" alt=""/>
          <span className="login__city-text"><span className="login__city-caption">Explore</span><span className="login__city-name">Amsterdam</span></span>
        </Link>
      </div>
    </main>
  );
}
