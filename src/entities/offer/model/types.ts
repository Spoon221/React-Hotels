export const cities = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'] as const;
export type CityName = typeof cities[number];

export type Offer = {
  id: string;
  title: string;
  city: CityName;
  image: string;
  photos?: string[];
  price: number;
  type: 'apartment' | 'room' | 'house' | 'hotel';
  rating: number;
  premium: boolean;
  favorite: boolean;
  bedrooms: number;
  adults: number;
  goods: string[];
};

export type Review = {
  id: string;
  name: string;
  avatar: string;
  date: string;
  rating: number;
  text: string;
};

export type User = {
  id: string;
  nickname: string;
  email: string;
};

export type Session = {
  token: string;
  user: User;
};
