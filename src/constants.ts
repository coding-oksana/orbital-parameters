import { OrbitalPreset } from '@typeProps/orbitParams';

export const PRESETS: OrbitalPreset[] = [
  {
    id: 'iss',
    name: 'ISS',
    subtitle: '408 km · 92.7 min',
    regime: 'LEO',
    elements: { a: 6786, e: 0.0006, i: 51.6, raan: 247, w: 130, nu: 0 },
  },
  {
    id: 'hubble',
    name: 'Hubble',
    subtitle: '547 km · 95.4 min',
    regime: 'LEO',
    elements: { a: 6918, e: 0.0003, i: 28.5, raan: 80, w: 60, nu: 0 },
  },
  {
    id: 'gps',
    name: 'GPS III',
    subtitle: '20 200 km · 717 min',
    regime: 'MEO',
    elements: { a: 26560, e: 0.01, i: 55, raan: 0, w: 0, nu: 0 },
  },
  {
    id: 'molniya',
    name: 'Molniya',
    subtitle: '500–39 700 km · 720 min',
    regime: 'HEO',
    elements: { a: 26560, e: 0.74, i: 63.4, raan: 45, w: 270, nu: 0 },
  },
  {
    id: 'geo',
    name: 'GEO',
    subtitle: '35 786 km · 1436 min',
    regime: 'GEO',
    elements: { a: 42164, e: 0.0001, i: 0, raan: 0, w: 0, nu: 0 },
  },
  {
    id: 'sso',
    name: 'Sun-sync',
    subtitle: '700 km · 98.8 min',
    regime: 'SSO',
    elements: { a: 7078, e: 0.001, i: 98.2, raan: 90, w: 0, nu: 0 },
  },
];
