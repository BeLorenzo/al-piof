import type { CSSProperties } from 'react';

export type CardinalDirection =
  | 'N'
  | 'NNE'
  | 'NE'
  | 'ENE'
  | 'E'
  | 'ESE'
  | 'SE'
  | 'SSE'
  | 'S'
  | 'SSW'
  | 'SW'
  | 'WSW'
  | 'W'
  | 'WNW'
  | 'NW'
  | 'NNW';

const DIRECTIONS: CardinalDirection[] = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];

export function getWindDirection(deg: number): CardinalDirection {
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return DIRECTIONS[index];
}

export function getWindArrowStyle(deg: number): CSSProperties {
  // Arrow pointing up represents North (0 deg). Rotate clockwise by deg.
  return {
    transform: `rotate(${deg}deg)`,
    display: 'inline-block',
    transition: 'transform 0.2s ease',
  };
}
