import type {JSX} from 'react';
import type {IconProps} from './model/icon-props';

export function Icon({name, className}: IconProps): JSX.Element {
  return <svg className={className} aria-hidden="true"><use href={`#${name}`} /></svg>;
}
