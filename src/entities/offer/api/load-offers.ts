import type {Offer, Review, Session, User} from '../model/types';

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error('VITE_API_URL is not configured.');
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {token, headers, ...init} = options;
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as {error?: string} | null;
    throw new Error(body?.error ?? 'Unable to complete request.');
  }

  return response.json() as Promise<T>;
}

export function loadRemoteOffers(token?: string | null, signal?: AbortSignal): Promise<Offer[]> {
  return request<Offer[]>('/offers', {signal, token});
}

export function loadOffer(offerId: string, signal?: AbortSignal): Promise<Offer> {
  return request<Offer>(`/offers/${offerId}`, {signal});
}

export function updateFavorite(
  offerId: string,
  favorite: boolean,
  token: string,
): Promise<Offer> {
  return request<Offer>(`/offers/${offerId}/favorite`, {
    method: 'POST',
    token,
    body: JSON.stringify({favorite}),
  });
}

export function loadReviews(offerId: string, signal?: AbortSignal): Promise<Review[]> {
  return request<Review[]>(`/offers/${offerId}/reviews`, {signal});
}

export function createReview(
  offerId: string,
  review: Pick<Review, 'rating' | 'text'>,
  token: string,
): Promise<Review> {
  return request<Review>(`/offers/${offerId}/reviews`, {
    method: 'POST',
    token,
    body: JSON.stringify(review),
  });
}

export function login(email: string, password: string): Promise<Session> {
  return request<Session>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password}),
  });
}

export function register(
  nickname: string,
  email: string,
  password: string,
): Promise<Session> {
  return request<Session>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({nickname, email, password}),
  });
}

export function getCurrentUser(token: string, signal?: AbortSignal): Promise<User> {
  return request<User>('/auth/me', {signal, token});
}

export function logout(token: string): Promise<void> {
  return request<void>('/auth/logout', {method: 'POST', token});
}
