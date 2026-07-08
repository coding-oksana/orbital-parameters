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
