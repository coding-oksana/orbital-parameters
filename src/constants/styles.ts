import { OrbitalPreset, OrbitRegime } from '@typeProps/orbitParams';
import { ParamStatus } from '@utils/orbitalLimits';

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

export const STATUS_STYLES: Record<
  NonNullable<ParamStatus['level']>,
  { dot: string; text: string; bg: string }
> = {
  ok: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: '',
  },
  warn: {
    dot: 'bg-amber-400',
    text: 'text-amber-700  dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40',
  },
  error: {
    dot: 'bg-red-400',
    text: 'text-red-700    dark:text-red-300',
    bg: 'bg-red-50   dark:bg-red-950/40   border border-red-200/60   dark:border-red-800/40',
  },
  disabled: {
    dot: 'bg-slate-300',
    text: 'text-slate-400  dark:text-slate-500',
    bg: 'bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-700/40',
  },
};

export const REGIME_STYLES: Record<
  OrbitRegime,
  { badge: string; dot: string }
> = {
  LEO: {
    badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
    dot: 'bg-emerald-400',
  },
  MEO: {
    badge: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
    dot: 'bg-amber-400',
  },
  GEO: {
    badge: 'text-violet-400 bg-violet-400/10 border-violet-400/25',
    dot: 'bg-violet-400',
  },
  HEO: {
    badge: 'text-rose-400 bg-rose-400/10 border-rose-400/25',
    dot: 'bg-rose-400',
  },
  SSO: {
    badge: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
    dot: 'bg-sky-400',
  },
};
