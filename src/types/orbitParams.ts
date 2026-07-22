export interface KeplerianElements {
  /** Semi-major axis (km) — defines the size of the orbit */
  a: number;
  /** Eccentricity (0–1) — 0 = circle, → 1 = parabola */
  e: number;
  /** Inclination (°) — tilt of the orbital plane */
  i: number;
  /** Right Ascension of Ascending Node (°) */
  raan: number;
  /** Argument of Perigee (°) — orientation within the plane */
  w: number;
  /** True Anomaly (°) — current angular position along orbit */
  nu: number;
}

export type OrbitRegime = 'LEO' | 'MEO' | 'GEO' | 'HEO' | 'SSO';

export interface OrbitalPreset {
  id: string;
  name: string;
  subtitle: string;
  regime: OrbitRegime;
  elements: KeplerianElements;
}

export interface DerivedOrbitalStats {
  /** Orbital period (minutes) */
  periodMin: number;
  /** Apoapsis altitude above surface (km) */
  apoapsisKm: number;
  /** Periapsis altitude above surface (km) */
  periapsisKm: number;
  /** Orbital speed at current true anomaly (km/s) */
  velocityKms: number;
  /** Number of complete orbits per day */
  revsPerDay: number;
}

export interface OrbitalValues {
  a: number; // km
  e: number; // 0–∞ (< 1 bound, ≥ 1 open)
  i: number; // deg, 0–180
  raan: number; // deg, 0–360
  omega: number; // deg, 0–360
  nu: number; // deg, 0–360
}

export type StatusLevel = 'ok' | 'warn' | 'error' | 'disabled';

export interface ParamStatus {
  message: string;
  level: StatusLevel;
}

export interface ParamLimits {
  min: number;
  max: number;
  status: ParamStatus;
}

export interface DerivedOrbital {
  rPeriapsis: number; // km — always defined
  rApoapsis: number | null; // km — null for hyperbolic
  periodMin: number | null; // minutes — null for hyperbolic
  vPeriapsis: number | null; // km/s
  vApoapsis: number | null; // km/s — null for hyperbolic
  orbitType: 'circular' | 'ellipse' | 'hyperbola';
}
